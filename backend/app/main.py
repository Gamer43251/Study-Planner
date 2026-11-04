import os
import time
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database import Base, engine, get_db
from app.routers import dashboard, modules, tasks


def cors_origins() -> list[str]:
    origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
    ]
    extra = os.getenv("CORS_ORIGINS", "")
    origins.extend(item.strip() for item in extra.split(",") if item.strip())
    return origins


@asynccontextmanager
async def lifespan(_app: FastAPI):
    last_error = None
    for _attempt in range(30):
        try:
            Base.metadata.create_all(bind=engine)
            last_error = None
            break
        except Exception as exc:
            last_error = exc
            time.sleep(2)
    if last_error is not None:
        raise last_error
    yield


app = FastAPI(title="Study Planner API", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins(),
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(modules.router)
app.include_router(tasks.router)
app.include_router(dashboard.router)


@app.get("/health")
def health(db: Session = Depends(get_db)):
    db.execute(text("SELECT 1"))
    return {"status": "ok"}
