from datetime import datetime, date
from typing import Optional, List

from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import create_engine, Column, Integer, String, DateTime, ForeignKey, Text, Date
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

# =====================
#   FastAPI Setup
# =====================
app = FastAPI()

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


class MoodBase(BaseModel):
    user_id: int
    mood: str
    mood_date: date


class MoodCreate(MoodBase):
    pass


class Mood(MoodBase):
    id: int
    created_at: datetime


class PromptBase(BaseModel):
    prompt_text: str


class PromptCreate(PromptBase):
    pass


class Prompt(PromptBase):
    id: int
    created_at: datetime


class JournalBase(BaseModel):
    user_id: int
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
        password_hash=user.password,
        display_name=user.display_name,
        created_at=now,
        updated_at=now,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return User(**db_user.__dict__)


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

# =====================
#   MOODS ENDPOINTS
# =====================

@app.post("/moods/", response_model=Mood)
def create_mood(mood: MoodCreate, db: Session = Depends(get_db)):
    if not db.query(UserDB).filter(UserDB.id == mood.user_id).first():
        raise HTTPException(status_code=400, detail="User does not exist")
    db_mood = MoodDB(
        user_id=mood.user_id,
        mood=mood.mood,
        mood_date=mood.mood_date,
        created_at=datetime.utcnow()
    )
    db.add(db_mood)
    db.commit()
    db.refresh(db_mood)
    return Mood(**db_mood.__dict__)


@app.get("/moods/", response_model=List[Mood])
def list_moods(db: Session = Depends(get_db)):
    return [Mood(**m.__dict__) for m in db.query(MoodDB).all()]


@app.get("/moods/{mood_id}", response_model=Mood)
def get_mood(mood_id: int, db: Session = Depends(get_db)):
    mood = db.query(MoodDB).filter(MoodDB.id == mood_id).first()
    if not mood:
        raise HTTPException(status_code=404, detail="Mood not found")
    return Mood(**mood.__dict__)


@app.put("/moods/{mood_id}", response_model=Mood)
def update_mood(mood_id: int, mood: MoodBase, db: Session = Depends(get_db)):
    db_mood = db.query(MoodDB).filter(MoodDB.id == mood_id).first()
    if not db_mood:
        raise HTTPException(status_code=404, detail="Mood not found")
    db_mood.user_id = mood.user_id
    db_mood.mood = mood.mood
    db_mood.mood_date = mood.mood_date
    db.commit()
    db.refresh(db_mood)
    return Mood(**db_mood.__dict__)


@app.delete("/moods/{mood_id}")
def delete_mood(mood_id: int, db: Session = Depends(get_db)):
    mood = db.query(MoodDB).filter(MoodDB.id == mood_id).first()
    if not mood:
        raise HTTPException(status_code=404, detail="Mood not found")
    db.delete(mood)
    db.commit()
    return {"msg": "Deleted"}

# =====================
#   PROMPTS ENDPOINTS
# =====================

@app.post("/prompts/", response_model=Prompt)
def create_prompt(prompt: PromptCreate, db: Session = Depends(get_db)):
    db_prompt = PromptDB(prompt_text=prompt.prompt_text, created_at=datetime.utcnow())
    db.add(db_prompt)
    db.commit()
    db.refresh(db_prompt)
    return Prompt(**db_prompt.__dict__)


@app.get("/prompts/", response_model=List[Prompt])
def list_prompts(db: Session = Depends(get_db)):
    return [Prompt(**p.__dict__) for p in db.query(PromptDB).all()]


@app.get("/prompts/{prompt_id}", response_model=Prompt)
def get_prompt(prompt_id: int, db: Session = Depends(get_db)):
    prompt = db.query(PromptDB).filter(PromptDB.id == prompt_id).first()
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")
    return Prompt(**prompt.__dict__)


@app.put("/prompts/{prompt_id}", response_model=Prompt)
def update_prompt(prompt_id: int, prompt: PromptBase, db: Session = Depends(get_db)):
    db_prompt = db.query(PromptDB).filter(PromptDB.id == prompt_id).first()
    if not db_prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")
    db_prompt.prompt_text = prompt.prompt_text
    db.commit()
    db.refresh(db_prompt)
    return Prompt(**db_prompt.__dict__)


@app.delete("/prompts/{prompt_id}")
def delete_prompt(prompt_id: int, db: Session = Depends(get_db)):
    db.query(JournalDB).filter(JournalDB.prompt_id == prompt_id).delete()
    prompt = db.query(PromptDB).filter(PromptDB.id == prompt_id).first()
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")
    db.delete(prompt)
    db.commit()
    return {"msg": "Deleted"}

# =====================
#   JOURNAL ENDPOINTS
# =====================

@app.post("/journal/", response_model=Journal)
def create_journal(journal: JournalCreate, db: Session = Depends(get_db)):
    if not db.query(UserDB).filter(UserDB.id == journal.user_id).first():
        raise HTTPException(status_code=400, detail="User does not exist")
    if journal.prompt_id and not db.query(PromptDB).filter(PromptDB.id == journal.prompt_id).first():
        raise HTTPException(status_code=400, detail="Prompt does not exist")
    db_journal = JournalDB(
        user_id=journal.user_id,
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
def list_journals(db: Session = Depends(get_db)):
    return [Journal(**j.__dict__) for j in db.query(JournalDB).all()]


@app.get("/journal/{journal_id}", response_model=Journal)
def get_journal(journal_id: int, db: Session = Depends(get_db)):
    journal = db.query(JournalDB).filter(JournalDB.id == journal_id).first()
    if not journal:
        raise HTTPException(status_code=404, detail="Journal not found")
    return Journal(**journal.__dict__)


@app.put("/journal/{journal_id}", response_model=Journal)
def update_journal(journal_id: int, journal: JournalBase, db: Session = Depends(get_db)):
    db_journal = db.query(JournalDB).filter(JournalDB.id == journal_id).first()
    if not db_journal:
        raise HTTPException(status_code=404, detail="Journal not found")
    if journal.prompt_id and not db.query(PromptDB).filter(PromptDB.id == journal.prompt_id).first():
        raise HTTPException(status_code=400, detail="Prompt does not exist")
    db_journal.user_id = journal.user_id
    db_journal.prompt_id = journal.prompt_id
    db_journal.entry_date = journal.entry_date
    db_journal.content = journal.content
    db.commit()
    db.refresh(db_journal)
    return Journal(**db_journal.__dict__)


@app.delete("/journal/{journal_id}")
def delete_journal(journal_id: int, db: Session = Depends(get_db)):
    journal = db.query(JournalDB).filter(JournalDB.id == journal_id).first()
    if not journal:
        raise HTTPException(status_code=404, detail="Journal not found")
    db.delete(journal)
    db.commit()
    return {"msg": "Deleted"}
