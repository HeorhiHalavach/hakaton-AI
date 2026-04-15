from fastapi import FastAPI, Depends, BackgroundTasks
from fastapi.responses import FileResponse
import edge_tts
import os
import uuid
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
    user_id: str
    text: str


@app.post("/api/analyze")
async def analyze_text(entry: DiaryEntry, db: Session = Depends(get_db)):
    try:
        result = process_user_note(entry.text)

        new_entry = DiaryEntryDB(
            user_id=entry.user_id,
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
async def get_history(user_id:str,db: Session = Depends(get_db)):
    try:
        entries = db.query(DiaryEntryDB).filter(DiaryEntryDB.user_id == user_id).order_by(DiaryEntryDB.timestamp.asc()).all()

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
async def get_weekly_statistics(user_id: str,db: Session = Depends(get_db)):
    try:
        now = datetime.now(timezone.utc).replace(tzinfo=None)
        start_date = now - timedelta(days=7)

        entries = db.query(DiaryEntryDB).filter(
            DiaryEntryDB.user_id == user_id,
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
async def get_monthly_statistics(user_id: str,db: Session = Depends(get_db)):
    try:
        now = datetime.now(timezone.utc).replace(tzinfo=None)
        start_date = now - timedelta(days=30)

        entries = db.query(DiaryEntryDB).filter(
            DiaryEntryDB.user_id == user_id,
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
        return {"status" : "error", "message" : str(e)}

class TTSRequest(BaseModel):
    text: str
def remove_file(path: str):
    try:
        os.remove(path)
    except Exception as e:
        pass
@app.post("/api/speak")
async def vocalize_text(request: TTSRequest, background_tasks: BackgroundTasks):
    try:
        filename = f"bielik_{uuid.uuid4().hex}.mp3"
        voice = "pl-PL-ZofiaNeural"
        communicate = edge_tts.Communicate(request.text, voice)
        await communicate.save(filename)
        background_tasks.add_task(remove_file, filename)
        return FileResponse(path=filename,media_type="audio/mpeg" ,filename="response.mp3")
    except Exception as e:
        return {"status": "error", "message": str(e)}
@app.delete("/api/clear")
async def clear_database(db: Session = Depends(get_db)):
    try:
        db.query(DiaryEntryDB).delete()
        db.commit()
        return {"status": "success", "message": "Baza została wyczyszczona!"}
    except Exception as e:
        db.rollback()
        return {"status": "error", "message": str(e)}