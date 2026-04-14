from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import DiaryEntryDB, get_db
from ai_core import process_user_note
from datetime import datetime, timedelta, timezone

app = FastAPI()

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
            og_text=entry.text,
            score=result["score"],
            response=result["response"]
        )
        db.add(new_entry)
        db.commit()
        db.refresh(new_entry)

        return {
            "status": "success",
            "score": result["score"],
            "response": result["response"]
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}


@app.get("/api/history")
async def get_history(db: Session = Depends(get_db)):
    try:
        entries = db.query(DiaryEntryDB).order_by(DiaryEntryDB.timestamp.asc()).all()

        history = [{
            "id": e.id,
            "date": e.timestamp,
            "og_text": e.og_text,
            "score": e.score,
            "response": e.response
        } for e in entries]

        return {"status": "success", "data": history}
    except Exception as e:
        return {"status": "error", "message": str(e)}
    
@app.get("/api/statistics/weekly")
async def get_weekly_statistics(db: Session = Depends(get_db)):
    try:
        now = datetime.now(timezone.utc).replace(tzinfo=None)
        start_date = now - timedelta(days=7)

        entries = db.query(DiaryEntryDB).filter(
            DiaryEntryDB.timestamp >= start_date
        ).order_by(DiaryEntryDB.timestamp.asc()).all()

        chart_data = []
        for e in entries:
            chart_data.append({
                "id": e.id,
                "timestamp": e.timestamp.isoformat(),
                "label": e.timestamp.strftime("%d.%m %H:%M"), 
                "score": round(e.score, 2),
                "og_text": e.og_text, 
                "ai_response": e.response
            })

        return {
            "status": "success",
            "count": len(chart_data),
            "data": chart_data
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}
    
@app.get("/api/statistics/monthly")
async def get_monthly_statistics(db: Session = Depends(get_db)):
    try:
        now = datetime.now(timezone.utc).replace(tzinfo=None)
        start_date = now - timedelta(days=30)

        entries = db.query(DiaryEntryDB).filter(
            DiaryEntryDB.timestamp >= start_date
        ).order_by(DiaryEntryDB.timestamp.asc()).all()

        chart_data = []
        for e in entries:
            chart_data.append({
                "id": e.id,
                "timestamp": e.timestamp.isoformat(),
                "label": e.timestamp.strftime("%d.%m"), 
                "score": round(e.score, 2),
                "og_text": e.og_text,
                "ai_response": e.response
            })

        return {
            "status": "success",
            "count": len(chart_data),
            "data": chart_data
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}