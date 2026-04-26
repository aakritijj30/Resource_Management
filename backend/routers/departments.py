from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from models.department import Department
from utils.dependencies import get_db

router = APIRouter(prefix="/departments", tags=["departments"], redirect_slashes=False)


class DepartmentOut(BaseModel):
    id: int
    name: str

    model_config = {"from_attributes": True}


@router.get("/", response_model=List[DepartmentOut])
def list_departments(db: Session = Depends(get_db)):
    """Public endpoint — returns all departments for the signup form dropdown."""
    return db.query(Department).order_by(Department.name).all()
