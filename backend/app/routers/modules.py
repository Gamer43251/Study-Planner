from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud
from app.database import get_db
from app.schemas import ModuleCreate, ModuleRead, ModuleUpdate

router = APIRouter(prefix="/modules", tags=["modules"])


@router.get("", response_model=list[ModuleRead])
def list_modules(db: Session = Depends(get_db)):
    return crud.list_modules(db)


@router.post("", response_model=ModuleRead, status_code=201)
def create_module(payload: ModuleCreate, db: Session = Depends(get_db)):
    return crud.create_module(db, payload)


@router.get("/{module_id}", response_model=ModuleRead)
def get_module(module_id: int, db: Session = Depends(get_db)):
    module = crud.get_module(db, module_id)
    if module is None:
        raise HTTPException(status_code=404, detail="Module not found")
    return module


@router.patch("/{module_id}", response_model=ModuleRead)
def update_module(module_id: int, payload: ModuleUpdate, db: Session = Depends(get_db)):
    module = crud.get_module(db, module_id)
    if module is None:
        raise HTTPException(status_code=404, detail="Module not found")
    return crud.update_module(db, module, payload)


@router.delete("/{module_id}", status_code=204)
def delete_module(module_id: int, db: Session = Depends(get_db)):
    module = crud.get_module(db, module_id)
    if module is None:
        raise HTTPException(status_code=404, detail="Module not found")
    crud.delete_module(db, module)
