from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Module, Task
from app.schemas import ModuleCreate, ModuleUpdate, TaskCreate, TaskUpdate


def list_modules(db: Session) -> list[Module]:
    return list(db.scalars(select(Module).order_by(Module.id)))


def get_module(db: Session, module_id: int) -> Module | None:
    return db.get(Module, module_id)


def create_module(db: Session, payload: ModuleCreate) -> Module:
    module = Module(**payload.model_dump())
    db.add(module)
    db.commit()
    db.refresh(module)
    return module


def update_module(db: Session, module: Module, payload: ModuleUpdate) -> Module:
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(module, field, value)
    db.commit()
    db.refresh(module)
    return module


def delete_module(db: Session, module: Module) -> None:
    db.delete(module)
    db.commit()


def list_tasks(db: Session, module_id: int | None = None) -> list[Task]:
    query = select(Task).order_by(Task.deadline, Task.id)
    if module_id is not None:
        query = query.where(Task.module_id == module_id)
    return list(db.scalars(query))


def get_task(db: Session, task_id: int) -> Task | None:
    return db.get(Task, task_id)


def create_task(db: Session, payload: TaskCreate) -> Task:
    data = payload.model_dump()
    data["status"] = payload.status.value
    task = Task(**data)
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


def update_task(db: Session, task: Task, payload: TaskUpdate) -> Task:
    data = payload.model_dump(exclude_unset=True)
    if "status" in data and data["status"] is not None:
        data["status"] = data["status"].value
    for field, value in data.items():
        setattr(task, field, value)
    db.commit()
    db.refresh(task)
    return task


def delete_task(db: Session, task: Task) -> None:
    db.delete(task)
    db.commit()
