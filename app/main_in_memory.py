from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime, date

app = FastAPI()

# IN-MEMORY DATABASE
db = {
    "users": [],
    "moods": [],
    "journal": [],
    "prompts": []
}
id_counters = {
    "users": 1,
    "moods": 1,
    "journal": 1,
    "prompts": 1,
}

# =====================
#   Pydantic MODELS
# =====================

# USERS
class UserBase(BaseModel):
    email: EmailStr
    display_name: Optional[str] = None

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class User(UserBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

# MOODS
class MoodBase(BaseModel):
    user_id: int
    mood: str
    mood_date: date

class MoodCreate(MoodBase):
    pass

class Mood(MoodBase):
    id: int
    created_at: datetime

# PROMPTS
class PromptBase(BaseModel):
    prompt_text: str

class PromptCreate(PromptBase):
    pass

class Prompt(PromptBase):
    id: int
    created_at: datetime

# JOURNAL
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
#   UTILITY FUNCTIONS
# =====================
def get_next_id(table: str) -> int:
    val = id_counters[table]
    id_counters[table] += 1
    return val

def find_by_id(table: str, id_: int):
    for item in db[table]:
        if item['id'] == id_:
            return item
    return None

def remove_by_id(table: str, id_: int):
    for i, item in enumerate(db[table]):
        if item['id'] == id_:
            del db[table][i]
            return True
    return False

# =====================
#   USERS ENDPOINTS
# =====================
@app.post("/users/", response_model=User)
def create_user(user: UserCreate):
    # Check for unique email
    if any(u['email'] == user.email for u in db["users"]):
        raise HTTPException(status_code=400, detail="Email already registered")
    user_dict = user.dict()
    user_dict["id"] = get_next_id("users")
    user_dict["password_hash"] = user_dict.pop("password")  # Fake hash
    now = datetime.utcnow()
    user_dict["created_at"] = now
    user_dict["updated_at"] = now
    db["users"].append(user_dict)
    return User(**user_dict)

@app.get("/users/", response_model=List[User])
def list_users():
    return [User(**{k: v for k, v in user.items() if k != "password_hash"}) for user in db["users"]]

@app.get("/users/{user_id}", response_model=User)
def get_user(user_id: int):
    user = find_by_id("users", user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user = {k: v for k, v in user.items() if k != "password_hash"}
    return User(**user)

@app.put("/users/{user_id}", response_model=User)
def update_user(user_id: int, user: UserBase):
    existing = find_by_id("users", user_id)
    if not existing:
        raise HTTPException(status_code=404, detail="User not found")
    existing.update(user.dict())
    existing["updated_at"] = datetime.utcnow()
    return User(**{k: v for k, v in existing.items() if k != "password_hash"})

@app.delete("/users/{user_id}")
def delete_user(user_id: int):
    if not remove_by_id("users", user_id):
        raise HTTPException(status_code=404, detail="User not found")
    # Cascade delete moods and journals
    db["moods"] = [m for m in db["moods"] if m["user_id"] != user_id]
    db["journal"] = [j for j in db["journal"] if j["user_id"] != user_id]
    return {"msg": "Deleted"}

# =====================
#   MOODS ENDPOINTS
# =====================
@app.post("/moods/", response_model=Mood)
def create_mood(mood: MoodCreate):
    # Check user exists
    if not find_by_id("users", mood.user_id):
        raise HTTPException(status_code=400, detail="User does not exist")
    mood_dict = mood.dict()
    mood_dict["id"] = get_next_id("moods")
    mood_dict["created_at"] = datetime.utcnow()
    db["moods"].append(mood_dict)
    return Mood(**mood_dict)

@app.get("/moods/", response_model=List[Mood])
def list_moods():
    return [Mood(**m) for m in db["moods"]]

@app.get("/moods/{mood_id}", response_model=Mood)
def get_mood(mood_id: int):
    mood = find_by_id("moods", mood_id)
    if not mood:
        raise HTTPException(status_code=404, detail="Mood not found")
    return Mood(**mood)

@app.put("/moods/{mood_id}", response_model=Mood)
def update_mood(mood_id: int, mood: MoodBase):
    existing = find_by_id("moods", mood_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Mood not found")
    existing.update(mood.dict())
    return Mood(**existing)

@app.delete("/moods/{mood_id}")
def delete_mood(mood_id: int):
    if not remove_by_id("moods", mood_id):
        raise HTTPException(status_code=404, detail="Mood not found")
    return {"msg": "Deleted"}

# =====================
#   PROMPTS ENDPOINTS
# =====================
@app.post("/prompts/", response_model=Prompt)
def create_prompt(prompt: PromptCreate):
    prompt_dict = prompt.dict()
    prompt_dict["id"] = get_next_id("prompts")
    prompt_dict["created_at"] = datetime.utcnow()
    db["prompts"].append(prompt_dict)
    return Prompt(**prompt_dict)

@app.get("/prompts/", response_model=List[Prompt])
def list_prompts():
    return [Prompt(**p) for p in db["prompts"]]

@app.get("/prompts/{prompt_id}", response_model=Prompt)
def get_prompt(prompt_id: int):
    prompt = find_by_id("prompts", prompt_id)
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")
    return Prompt(**prompt)

@app.put("/prompts/{prompt_id}", response_model=Prompt)
def update_prompt(prompt_id: int, prompt: PromptBase):
    existing = find_by_id("prompts", prompt_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Prompt not found")
    existing.update(prompt.dict())
    return Prompt(**existing)

@app.delete("/prompts/{prompt_id}")
def delete_prompt(prompt_id: int):
    if not remove_by_id("prompts", prompt_id):
        raise HTTPException(status_code=404, detail="Prompt not found")
    # Cascade delete journals using this prompt
    db["journal"] = [j for j in db["journal"] if j["prompt_id"] != prompt_id]
    return {"msg": "Deleted"}

# =====================
#   JOURNAL ENDPOINTS
# =====================
@app.post("/journal/", response_model=Journal)
def create_journal(journal: JournalCreate):
    # Validate user
    if not find_by_id("users", journal.user_id):
        raise HTTPException(status_code=400, detail="User does not exist")
    # Validate prompt (if any)
    if journal.prompt_id and not find_by_id("prompts", journal.prompt_id):
        raise HTTPException(status_code=400, detail="Prompt does not exist")
    journal_dict = journal.dict()
    journal_dict["id"] = get_next_id("journal")
    journal_dict["created_at"] = datetime.utcnow()
    db["journal"].append(journal_dict)
    return Journal(**journal_dict)

@app.get("/journal/", response_model=List[Journal])
def list_journals():
    return [Journal(**j) for j in db["journal"]]

@app.get("/journal/{journal_id}", response_model=Journal)
def get_journal(journal_id: int):
    journal = find_by_id("journal", journal_id)
    if not journal:
        raise HTTPException(status_code=404, detail="Journal not found")
    return Journal(**journal)

@app.put("/journal/{journal_id}", response_model=Journal)
def update_journal(journal_id: int, journal: JournalBase):
    existing = find_by_id("journal", journal_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Journal not found")
    if journal.prompt_id and not find_by_id("prompts", journal.prompt_id):
        raise HTTPException(status_code=400, detail="Prompt does not exist")
    existing.update(journal.dict())
    return Journal(**existing)

@app.delete("/journal/{journal_id}")
def delete_journal(journal_id: int):
    if not remove_by_id("journal", journal_id):
        raise HTTPException(status_code=404, detail="Journal not found")
    return {"msg": "Deleted"}