from datetime import datetime, timezone
from typing import Optional
from pydantic import BaseModel, field_serializer

class BaseSchema(BaseModel):
    """Base schema ensuring all datetimes are serialized as ISO 8601 UTC strings with 'Z'."""
    @field_serializer("createdAt", "updatedAt", "expiresAt", check_fields=False)
    def serialize_datetime(self, dt: Optional[datetime], _info):
        if dt is None:
            return None
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.isoformat().replace("+00:00", "Z")

