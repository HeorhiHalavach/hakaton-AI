from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime
from zoneinfo import ZoneInfo

SQLALCHEMY_DATABASE_URI = "sqlite:///./diary.db"
engine = create_engine(SQLALCHEMY_DATABASE_URI, connect_args={'check_same_thread': False})
session_local = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class DiaryEntryDB(Base):
    __tablename__ = "diary_entries"
    id = Column(Integer, primary_key=True)
    user_id = Column(String, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    og_text = Column(String)
    score = Column(Float)
    response = Column(String)
Base.metadata.create_all(engine)
def get_db():
    db = session_local()
    try:
        yield db
    finally:
        db.close()
    