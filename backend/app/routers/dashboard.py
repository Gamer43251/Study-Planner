from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import crud
from app.database import get_db
from progresslib import build_dashboard

router = APIRouter(tags=["dashboard"])


@router.get("/dashboard")
def dashboard(today: date | None = None, db: Session = Depends(get_db)):
    day = today or date.today()
    modules = [{"id": module.id, "name": module.name} for module in crud.list_modules(db)]
    tasks = [
        {
            "id": task.id,
            "title": task.title,
            "module_id": task.module_id,
            "status": task.status,
            "deadline": task.deadline,
            "estimated_minutes": task.estimated_minutes,
        }
        for task in crud.list_tasks(db)
    ]
    return build_dashboard(modules, tasks, day)
