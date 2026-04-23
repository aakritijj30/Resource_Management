from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from services.report_service import get_report_summary, get_top_resources, get_dept_usage, get_monthly_trends
from models.user import User, RoleEnum
from utils.dependencies import get_db, require_role

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/usage", dependencies=[Depends(require_role(RoleEnum.admin, RoleEnum.manager))])
def usage(db: Session = Depends(get_db), current_user: User = Depends(require_role(RoleEnum.admin, RoleEnum.manager))):
    dept_id = current_user.department_id if current_user.role == RoleEnum.manager else None
    return get_report_summary(db, department_id=dept_id)


@router.get("/trends", dependencies=[Depends(require_role(RoleEnum.admin, RoleEnum.manager))])
def trends(months: int = 6, db: Session = Depends(get_db), current_user: User = Depends(require_role(RoleEnum.admin, RoleEnum.manager))):
    dept_id = current_user.department_id if current_user.role == RoleEnum.manager else None
    return get_monthly_trends(db, months, department_id=dept_id)


@router.get("/dept", dependencies=[Depends(require_role(RoleEnum.admin, RoleEnum.manager))])
def dept(db: Session = Depends(get_db), current_user: User = Depends(require_role(RoleEnum.admin, RoleEnum.manager))):
    dept_id = current_user.department_id if current_user.role == RoleEnum.manager else None
    return get_dept_usage(db, department_id=dept_id)
