import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool  # <--- ДОБАВЛЕН ИМПОРТ
from unittest.mock import patch

from main import app
from database import Base, get_db, DiaryEntryDB

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

# ИСПРАВЛЕНИЕ: Добавлен poolclass=StaticPool, чтобы база в памяти не стиралась между запросами
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False},
    poolclass=StaticPool 
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Создаем таблицы в единой базе в памяти
Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

@patch("main.process_user_note")
def test_analyze_endpoint_success(mock_process):
    mock_process.return_value = {
        "original_text": "To był genialny dzień! Wszystko się udało i jestem mega szczęśliwy.",
        "clean_text": "To był genialny dzień! Wszystko się udało i jestem mega szczęśliwy.",
        "score": 4.5,
        "response": "Wspaniale słyszeć, że masz tak udany dzień!"
    }
    
    response = client.post(
        "/api/analyze",
        json={"text": "To był genialny dzień! Wszystko się udało i jestem mega szczęśliwy."}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success", data.get("message")
    assert "score" in data
    assert "response" in data

@patch("main.process_user_note")
def test_analyze_endpoint_empty_text(mock_process):
    mock_process.return_value = {"score": 3.0, "response": "Nie podałeś tekstu."}
    response = client.post(
        "/api/analyze",
        json={"text": ""}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ["success", "error"], data.get("message")

@patch("main.process_user_note")
def test_analyze_endpoint_symbols(mock_process):
    mock_process.return_value = {"score": 3.0, "response": "Spróbuj opisać to słowami."}
    response = client.post(
        "/api/analyze",
        json={"text": "??? !!! :)))"}
    )
    assert response.status_code == 200

def test_weekly_statistics_endpoint():
    response = client.get("/api/statistics/weekly")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success", data.get("message")
    assert isinstance(data["data"], list)

def test_monthly_statistics_endpoint():
    response = client.get("/api/statistics/monthly")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success", data.get("message")
    assert "count" in data
    assert isinstance(data["data"], list)