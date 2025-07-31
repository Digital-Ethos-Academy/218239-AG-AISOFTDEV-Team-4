import os
import tempfile
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from main import app, Base, get_db

# ✅ Create a temporary SQLite DB file
temp_db = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
DATABASE_URL = f"sqlite:///{temp_db.name}"

# ✅ Set up the SQLAlchemy engine and session
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# ✅ Override FastAPI's DB dependency
def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    yield
    TestingSessionLocal().close()
    Base.metadata.drop_all(bind=engine)
    engine.dispose()
    temp_db.close()
    os.remove(temp_db.name)

def test_create_user():
    response = client.post("/users/", json={
        "email": "test@example.com",
        "password": "testpass123",
        "display_name": "Test User"
    })
    assert response.status_code == 200
    assert response.json()["email"] == "test@example.com"

def test_create_user_duplicate_email():
    response = client.post("/users/", json={
        "email": "test@example.com",
        "password": "testpass123",
        "display_name": "Test User 2"
    })
    assert response.status_code == 400
    assert response.json()["detail"] == "Email already registered"

def test_list_users():
    response = client.get("/users/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert len(response.json()) >= 1

def test_get_user_success():
    response = client.get("/users/1")
    assert response.status_code == 200
    assert response.json()["email"] == "test@example.com"

def test_get_user_not_found():
    response = client.get("/users/999")
    assert response.status_code == 404

def test_update_user():
    response = client.put("/users/1", json={
        "email": "updated@example.com",
        "display_name": "Updated User"
    })
    assert response.status_code == 200
    assert response.json()["email"] == "updated@example.com"

def test_delete_user():
    response = client.delete("/users/1")
    assert response.status_code == 200
    assert response.json()["msg"] == "Deleted"

def test_delete_user_not_found():
    response = client.delete("/users/999")
    assert response.status_code == 404
