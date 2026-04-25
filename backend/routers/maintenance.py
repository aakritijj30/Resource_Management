from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from schemas.maintenance import MaintenanceCreate, MaintenanceOut
from services.maintenance_service import create_maintenance_block, get_maintenance_blocks, delete_maintenance_block, get_relevant_maintenance_blocks
from utils.dependencies import get_db, get_current_user, require_role
from models.user import User, RoleEnum

router = APIRouter(prefix="/maintenance", tags=["maintenance"])

@router.get("/", response_model=List[MaintenanceOut], dependencies=[Depends(require_role(RoleEnum.admin))])
def list_blocks(db: Session = Depends(get_db)):
    return get_maintenance_blocks(db)

@router.get("/relevant", response_model=List[MaintenanceOut])
def list_relevant_blocks(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return get_relevant_maintenance_blocks(db, current_user.department_id)

@router.post("/", response_model=MaintenanceOut, dependencies=[Depends(require_role(RoleEnum.admin))])
def create_block(data: MaintenanceCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return create_maintenance_block(db, data, current_user.id)

@router.delete("/{block_id}", dependencies=[Depends(require_role(RoleEnum.admin))])
def remove_block(block_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    delete_maintenance_block(db, block_id, current_user.id)
    return {"message": "Maintenance block removed", "id": block_id}