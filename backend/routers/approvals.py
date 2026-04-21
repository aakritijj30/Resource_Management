from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from schemas.approval import ApprovalDecide, ApprovalOut
from services.approval_service import get_pending_approvals, get_approval_by_id, decide_approval
from models.user import User, RoleEnum
from utils.dependencies import get_db, require_role

router = APIRouter(prefix="/approvals", tags=["approvals"])


@router.get("/queue", response_model=List[ApprovalOut])
def get_queue(
    db: Session = Depends(get_db),
    manager: User = Depends(require_role(RoleEnum.manager, RoleEnum.admin))
):
    return get_pending_approvals(db, manager)


@router.get("/{approval_id}", response_model=ApprovalOut)
def get_one(
    approval_id: int,
    db: Session = Depends(get_db),
    manager: User = Depends(require_role(RoleEnum.manager, RoleEnum.admin))
):
    return get_approval_by_id(db, approval_id, manager)


@router.post("/{approval_id}/decide", response_model=ApprovalOut)
def decide(
    approval_id: int,
    data: ApprovalDecide,
    db: Session = Depends(get_db),
    manager: User = Depends(require_role(RoleEnum.manager, RoleEnum.admin))
):
    return decide_approval(db, approval_id, data.decision, data.comment, manager)
