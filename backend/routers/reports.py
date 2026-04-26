from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Optional
from services.report_service import get_report_summary, get_top_resources, get_dept_usage, get_monthly_trends
from models.user import User, RoleEnum
from utils.dependencies import get_db, require_role

router = APIRouter(prefix="/reports", tags=["reports"], redirect_slashes=False)


@router.get("/usage", dependencies=[Depends(require_role(RoleEnum.admin, RoleEnum.manager))])
def usage(
    department_id: Optional[int] = None,
    db: Session = Depends(get_db), 
    current_user: User = Depends(require_role(RoleEnum.admin, RoleEnum.manager))
):
    dept_id = department_id if current_user.role == RoleEnum.admin else current_user.department_id
    return get_report_summary(db, department_id=dept_id)


@router.get("/trends", dependencies=[Depends(require_role(RoleEnum.admin, RoleEnum.manager))])
def trends(
    months: int = 6, 
    department_id: Optional[int] = None,
    db: Session = Depends(get_db), 
    current_user: User = Depends(require_role(RoleEnum.admin, RoleEnum.manager))
):
    dept_id = department_id if current_user.role == RoleEnum.admin else current_user.department_id
    return get_monthly_trends(db, months, department_id=dept_id)


@router.get("/dept", dependencies=[Depends(require_role(RoleEnum.admin, RoleEnum.manager))])
def dept(
    department_id: Optional[int] = None,
    db: Session = Depends(get_db), 
    current_user: User = Depends(require_role(RoleEnum.admin, RoleEnum.manager))
):
    dept_id = department_id if current_user.role == RoleEnum.admin else current_user.department_id
    return get_dept_usage(db, department_id=dept_id)
