from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from schemas.resource import ResourceCreate, ResourceOut, ResourceUpdate
from schemas.policy import PolicyCreate, PolicyUpdate, PolicyOut
from schemas.booking import BookingOut
from services.resource_service import get_all_resources, get_resource_by_id, create_resource, update_resource, deactivate_resource, reactivate_resource
from services.policy_service import upsert_policy, get_policy
from services.booking_service import get_resource_bookings
from services.audit_service import log_action
from models.audit_log import AuditActionEnum
from models.user import User, RoleEnum
from utils.dependencies import get_db, get_current_user, require_role

router = APIRouter(prefix="/resources", tags=["resources"], redirect_slashes=False)


@router.get("", response_model=List[ResourceOut])
@router.get("/", response_model=List[ResourceOut])
def list_resources(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100,
    active_only: bool = True
):
    # Admins see all resources; employees and managers see common + their dept
    user_role = current_user.role.value if hasattr(current_user.role, 'value') else str(current_user.role)
    role_str = user_role.lower()
    dept_filter = None if 'admin' in role_str else current_user.department_id
    return get_all_resources(db, skip, limit, active_only, department_id=dept_filter)


@router.get("/{resource_id}", response_model=ResourceOut)
@router.get("/{resource_id}/", response_model=ResourceOut)
def get_resource(resource_id: int, db: Session = Depends(get_db)):
    return get_resource_by_id(db, resource_id)


@router.post("/", response_model=ResourceOut, dependencies=[Depends(require_role(RoleEnum.admin))])
def create(data: ResourceCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    resource = create_resource(db, data)
    log_action(db, current_user.id, AuditActionEnum.resource_created, "resource", resource.id)
    db.commit()
    return resource


@router.patch("/{resource_id}", response_model=ResourceOut, dependencies=[Depends(require_role(RoleEnum.admin))])
@router.patch("/{resource_id}/", response_model=ResourceOut, dependencies=[Depends(require_role(RoleEnum.admin))])
def update(resource_id: int, data: ResourceUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    resource = update_resource(db, resource_id, data)
    log_action(db, current_user.id, AuditActionEnum.resource_updated, "resource", resource_id)
    db.commit()
    return resource


@router.patch("/{resource_id}/deactivate", dependencies=[Depends(require_role(RoleEnum.admin))])
@router.patch("/{resource_id}/deactivate/", dependencies=[Depends(require_role(RoleEnum.admin))])
def deactivate(resource_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    resource = deactivate_resource(db, resource_id)
    log_action(db, current_user.id, AuditActionEnum.resource_deactivated, "resource", resource_id)
    db.commit()
    return {"message": "Resource deactivated", "id": resource_id}


@router.patch("/{resource_id}/reactivate", dependencies=[Depends(require_role(RoleEnum.admin))])
@router.patch("/{resource_id}/reactivate/", dependencies=[Depends(require_role(RoleEnum.admin))])
def reactivate(resource_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    resource = reactivate_resource(db, resource_id)
    log_action(db, current_user.id, AuditActionEnum.resource_reactivated, "resource", resource_id)
    db.commit()
    return {"message": "Resource reactivated", "id": resource_id}


@router.get("/{resource_id}/policy", response_model=PolicyOut)
@router.get("/{resource_id}/policy/", response_model=PolicyOut)
def get_policy_route(resource_id: int, db: Session = Depends(get_db)):
    policy = get_policy(db, resource_id)
    if not policy:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="No policy configured for this resource")
    return policy


@router.put("/{resource_id}/policy", response_model=PolicyOut, dependencies=[Depends(require_role(RoleEnum.admin))])
@router.put("/{resource_id}/policy/", response_model=PolicyOut, dependencies=[Depends(require_role(RoleEnum.admin))])
def set_policy(resource_id: int, data: PolicyUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    policy = upsert_policy(db, resource_id, data.model_dump(exclude_unset=True))
    log_action(db, current_user.id, AuditActionEnum.policy_updated, "resource_policy", resource_id)
    db.commit()
    return policy


@router.get("/{resource_id}/bookings", response_model=List[BookingOut])
@router.get("/{resource_id}/bookings/", response_model=List[BookingOut])
def list_resource_bookings(resource_id: int, db: Session = Depends(get_db)):
    return get_resource_bookings(db, resource_id)
