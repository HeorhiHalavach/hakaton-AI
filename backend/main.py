from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import DiaryEntryDB, get_db
from srsly.ruamel_yaml import timestamp

from ai_core import process_user_note

app  = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class DiaryEntry(BaseModel):
    text: str
@app.post("/api/analyze")
async def analyze_text(entry: DiaryEntry, db: Session = Depends(get_db)):
    try:
        result = process_user_note(entry.text)
        new_entry = DiaryEntryDB(
            original_text=entry.text,
            score = result["score"],
            response = result["response"],
        )
        db.add(new_entry)
        db.commit()
        db.refresh(new_entry)
        return {"status": "success", "score": score, "response": response}
    except Exception as e:
        return {"status" : "error", "message" : str(e)}
@app.get("/api/history")
async def get_history(db: Session = Depends(get_db)):
    try:
        entries = db.query(DiaryEntry).order_by(DiaryEntryDB.timestamp.asc()).all()
        history = [{
            "id": e.id,
            "date": timestamp,
            "og_text": e.original_text,
            "score": e.score,
            "response": e.response,

        }
        for e in entries
        ]
        return {"status": "success", "data": history}
    except Exception as e:
        return {"status" : "error", "message" : str(e)}








