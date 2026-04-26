from sqlalchemy.orm import Session
from sqlalchemy import or_
from models.resource import Resource
from models.resource_policy import ResourcePolicy
from schemas.resource import ResourceCreate, ResourceUpdate
from utils.exceptions import ResourceNotFoundError


def get_all_resources(db: Session, skip: int = 0, limit: int = 100, active_only: bool = True, department_id: int = None):
    q = db.query(Resource)
    if active_only:
        q = q.filter(Resource.is_active == True)
    if department_id is not None:
        q = q.filter(or_(Resource.department_id == None, Resource.department_id == department_id))
    
    return q.offset(skip).limit(limit).all()


def get_resource_by_id(db: Session, resource_id: int) -> Resource:
    r = db.query(Resource).filter(Resource.id == resource_id).first()
    if not r:
        raise ResourceNotFoundError()
    return r


def create_resource(db: Session, data: ResourceCreate) -> Resource:
    resource = Resource(**data.model_dump())
    db.add(resource)
    db.commit()
    db.refresh(resource)
    return resource


def update_resource(db: Session, resource_id: int, data: ResourceUpdate) -> Resource:
    resource = get_resource_by_id(db, resource_id)
    for key, val in data.model_dump(exclude_unset=True).items():
        setattr(resource, key, val)
    db.commit()
    db.refresh(resource)
    return resource


def deactivate_resource(db: Session, resource_id: int) -> Resource:
    resource = get_resource_by_id(db, resource_id)
    resource.is_active = False
    db.commit()
    db.refresh(resource)
    return resource


def reactivate_resource(db: Session, resource_id: int) -> Resource:
    resource = get_resource_by_id(db, resource_id)
    resource.is_active = True
    db.commit()
    db.refresh(resource)
    return resource
