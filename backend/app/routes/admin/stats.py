from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.dependencies import get_current_admin_user
from app.models.user import User
from app.services.inventory_service import InventoryService
from app.schemas.analytics import DashboardStatsResponse

router = APIRouter(prefix="/api/admin/stats", tags=["Admin Stats"])

@router.get("", response_model=DashboardStatsResponse)
def get_admin_dashboard_stats(
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    return InventoryService.get_dashboard_stats(db)

