from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from services.report_service import get_report_summary, get_top_resources, get_dept_usage, get_monthly_trends
from models.user import RoleEnum
from utils.dependencies import get_db, require_role

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/usage", dependencies=[Depends(require_role(RoleEnum.admin, RoleEnum.manager))])
def usage(db: Session = Depends(get_db)):
    return get_report_summary(db)


@router.get("/trends", dependencies=[Depends(require_role(RoleEnum.admin, RoleEnum.manager))])
def trends(months: int = 6, db: Session = Depends(get_db)):
    return get_monthly_trends(db, months)


@router.get("/dept", dependencies=[Depends(require_role(RoleEnum.admin, RoleEnum.manager))])
def dept(db: Session = Depends(get_db)):
    return get_dept_usage(db)
