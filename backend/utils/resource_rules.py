from models.resource import Resource, ResourceTypeEnum


def is_shared_capacity_resource(resource: Resource | None) -> bool:
    if not resource:
        return False

    name = (resource.name or "").strip().lower()
    is_parking_slot = "parking slot" in name or name.startswith("parking")
    is_company_van = resource.type == ResourceTypeEnum.vehicle and "company van" in name
    return is_parking_slot or is_company_van
