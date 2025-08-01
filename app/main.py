from datetime import datetime, date, timedelta
from typing import Optional, List

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr, Field
from jose import JWTError, jwt
from sqlalchemy import create_engine, Column, Integer, String, DateTime, ForeignKey, Text, Date
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from passlib.context import CryptContext
from fastapi.middleware.cors import CORSMiddleware
from enum import Enum
from openai import OpenAI  # or your preferred LLM library
import os
from dotenv import load_dotenv
load_dotenv()


# =====================
#   FastAPI Setup
# =====================
app = FastAPI()

origins = [
    "http://localhost:3000"  # React dev server
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

openai_api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=openai_api_key)

# =====================
#   JWT Setup
# =====================
SECRET_KEY = "demo-secret-key"  # Replace with a secure env var in production
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# =====================
#   Database Setup
# =====================
DATABASE_URL = "sqlite:///./mental_health.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        user = db.query(UserDB).filter(UserDB.id == int(user_id)).first()
        if user is None:
            raise credentials_exception
        return user
    except JWTError:
        raise credentials_exception
    
MOOD_PROMPT_MAP = {
    "very_sad": "What has been weighing heavily on your heart?",
    "sad": "What's been bothering you lately?",
    "neutral": "How do you feel about today's events?",
    "happy": "What brought you joy today?",
    "very_happy": "What amazing thing happened today?"
}

@app.on_event("startup")
def seed_prompts():
    db = SessionLocal()
    for mood, text in MOOD_PROMPT_MAP.items():
        if not db.query(PromptDB).filter(PromptDB.prompt_text == text).first():
            db.add(PromptDB(prompt_text=text, created_at=datetime.utcnow()))
    db.commit()
    db.close()


# =====================
#   SQLAlchemy MODELS
# =====================

class UserDB(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    display_name = Column(String)
    created_at = Column(DateTime, nullable=False)
    updated_at = Column(DateTime)


class MoodDB(Base):
    __tablename__ = "moods"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    mood = Column(String, nullable=False)
    mood_date = Column(Date, nullable=False)
    created_at = Column(DateTime, nullable=False)


class PromptDB(Base):
    __tablename__ = "prompts"
    id = Column(Integer, primary_key=True, index=True)
    prompt_text = Column(String, nullable=False)
    created_at = Column(DateTime, nullable=False)


class JournalDB(Base):
    __tablename__ = "journal"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    prompt_id = Column(Integer, ForeignKey("prompts.id"), nullable=True)
    entry_date = Column(Date, nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, nullable=False)

Base.metadata.create_all(bind=engine)

# =====================
#   Pydantic MODELS
# =====================

class UserBase(BaseModel):
    email: EmailStr
    display_name: Optional[str] = None

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class User(UserBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime]

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class MoodBase(BaseModel):
    mood: str
    mood_date: date

class Mood(MoodBase):
    id: int
    created_at: datetime

class MoodLevel(str, Enum):
    angry = "angry"
    very_sad = "very_sad"
    sad = "sad"
    neutral = "neutral"
    happy = "happy"
    very_happy = "very_happy"

class MoodBase(BaseModel):
    mood: MoodLevel
    mood_date: date

class PromptBase(BaseModel):
    prompt_text: str

class PromptCreate(PromptBase):
    pass

class Prompt(PromptBase):
    id: int
    created_at: datetime

class JournalBase(BaseModel):
    prompt_id: Optional[int] = None
    entry_date: date
    content: str

class JournalCreate(JournalBase):
    pass

class Journal(JournalBase):
    id: int
    created_at: datetime

# =====================
#   USERS ENDPOINTS
# =====================

@app.post("/users/", response_model=User)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    if db.query(UserDB).filter(UserDB.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    now = datetime.utcnow()
    db_user = UserDB(
        email=user.email,
        password_hash=hash_password(user.password),
        display_name=user.display_name,
        created_at=now,
        updated_at=now,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return User(**db_user.__dict__)

@app.get("/users/me", response_model=User)
def read_users_me(current_user: UserDB = Depends(get_current_user)):
    return User(**{k: v for k, v in current_user.__dict__.items() if k != "password_hash" and not k.startswith("_")})

@app.get("/users/", response_model=List[User])
def list_users(db: Session = Depends(get_db)):
    users = db.query(UserDB).all()
    return [User(**{k: v for k, v in u.__dict__.items() if k != "_sa_instance_state" and k != "password_hash"}) for u in users]


@app.get("/users/{user_id}", response_model=User)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(UserDB).filter(UserDB.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return User(**{k: v for k, v in user.__dict__.items() if k != "_sa_instance_state" and k != "password_hash"})


@app.put("/users/{user_id}", response_model=User)
def update_user(user_id: int, user: UserBase, db: Session = Depends(get_db)):
    db_user = db.query(UserDB).filter(UserDB.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    db_user.email = user.email
    db_user.display_name = user.display_name
    db_user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_user)
    return User(**db_user.__dict__)


@app.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    db_user = db.query(UserDB).filter(UserDB.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    db.query(MoodDB).filter(MoodDB.user_id == user_id).delete()
    db.query(JournalDB).filter(JournalDB.user_id == user_id).delete()
    db.delete(db_user)
    db.commit()
    return {"msg": "Deleted"}

@app.post("/login")
def login(login: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(UserDB).filter(UserDB.email == login.email).first()
    if not user or not verify_password(login.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(data={"sub": str(user.id)})
    return {
        "message": "Login successful",
        "user_id": user.id,
        "display_name": user.display_name,
        "token": token
    }

# =====================
#   MOODS ENDPOINTS
# =====================

@app.post("/moods/", response_model=dict)
def create_mood(
    mood: MoodBase,
    db: Session = Depends(get_db),
    current_user: UserDB = Depends(get_current_user)
):
    # Check if a mood already exists for this user on this date
    existing_mood = db.query(MoodDB).filter(
        MoodDB.user_id == current_user.id,
        MoodDB.mood_date == mood.mood_date
    ).first()

    if existing_mood:
        raise HTTPException(
            status_code=400,
            detail=f"You've already logged a mood for {mood.mood_date}."
        )

    # If not, continue as normal
    db_mood = MoodDB(
        user_id=current_user.id,
        mood=mood.mood.value,
        mood_date=mood.mood_date,
        created_at=datetime.utcnow()
    )
    db.add(db_mood)
    db.commit()
    db.refresh(db_mood)

    prompt_text = MOOD_PROMPT_MAP[mood.mood.value]
    return {
        "mood": Mood(**db_mood.__dict__),
        "prompt": prompt_text
    }


@app.get("/moods/", response_model=List[Mood])
def list_moods(
    db: Session = Depends(get_db),
    current_user: UserDB = Depends(get_current_user)
):
    moods = db.query(MoodDB).filter(MoodDB.user_id == current_user.id).all()
    return [Mood(**m.__dict__) for m in moods]


# =====================
#   PROMPTS ENDPOINTS
# =====================

@app.get("/prompts/", response_model=List[Prompt])
def list_prompts(db: Session = Depends(get_db)):
    return [Prompt(**p.__dict__) for p in db.query(PromptDB).all()]


@app.get("/prompts/{prompt_id}", response_model=Prompt)
def get_prompt(prompt_id: int, db: Session = Depends(get_db)):
    prompt = db.query(PromptDB).filter(PromptDB.id == prompt_id).first()
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")
    return Prompt(**prompt.__dict__)

# =====================
#   JOURNAL ENDPOINTS
# =====================

@app.post("/journal/", response_model=Journal)
def create_journal(journal: JournalCreate, db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_user)):
    if journal.prompt_id and not db.query(PromptDB).filter(PromptDB.id == journal.prompt_id).first():
        raise HTTPException(status_code=400, detail="Prompt does not exist")
    db_journal = JournalDB(
        user_id=current_user.id,
        prompt_id=journal.prompt_id,
        entry_date=journal.entry_date,
        content=journal.content,
        created_at=datetime.utcnow()
    )
    db.add(db_journal)
    db.commit()
    db.refresh(db_journal)
    return Journal(**db_journal.__dict__)

@app.get("/journal/", response_model=List[Journal])
def list_journals(db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_user)):
    return [Journal(**j.__dict__) for j in db.query(JournalDB).filter(JournalDB.user_id == current_user.id).all()]

@app.get("/journal/{journal_id}", response_model=Journal)
def get_journal(journal_id: int, db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_user)):
    journal = db.query(JournalDB).filter(JournalDB.id == journal_id, JournalDB.user_id == current_user.id).first()
    if not journal:
        raise HTTPException(status_code=404, detail="Journal not found")
    return Journal(**journal.__dict__)

@app.put("/journal/{journal_id}", response_model=Journal)
def update_journal(journal_id: int, journal: JournalBase, db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_user)):
    db_journal = db.query(JournalDB).filter(JournalDB.id == journal_id, JournalDB.user_id == current_user.id).first()
    if not db_journal:
        raise HTTPException(status_code=404, detail="Journal not found")
    if journal.prompt_id and not db.query(PromptDB).filter(PromptDB.id == journal.prompt_id).first():
        raise HTTPException(status_code=400, detail="Prompt does not exist")
    db_journal.prompt_id = journal.prompt_id
    db_journal.entry_date = journal.entry_date
    db_journal.content = journal.content
    db.commit()
    db.refresh(db_journal)
    return Journal(**db_journal.__dict__)

@app.delete("/journal/{journal_id}")
def delete_journal(journal_id: int, db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_user)):
    journal = db.query(JournalDB).filter(JournalDB.id == journal_id, JournalDB.user_id == current_user.id).first()
    if not journal:
        raise HTTPException(status_code=404, detail="Journal not found")
    db.delete(journal)
    db.commit()
    return {"msg": "Deleted"}

@app.post("/journal/feedback", response_model=dict)
async def get_journal_feedback(entry: dict):
    journal_text = entry.get("content")
    if not journal_text:
        raise HTTPException(status_code=400, detail="Missing journal content")

    prompt = f"""You are a helpful AI assistant for mental health journaling.
    
    Here is a journal entry from a user:
    "{journal_text}"
    
    Summarize this journal in 1–2 sentences, and provide two reflective follow-up questions to help the user think more deeply."""

    response = client.chat.completions.create(
        model="gpt-4.1",
        messages=[{"role": "user", "content": prompt}]
    )

    result = response.choices[0].message.content.strip()
    return {"feedback": result}
