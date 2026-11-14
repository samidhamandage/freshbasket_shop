from sqlalchemy.orm import Session
from app.services.inventory_service import InventoryService
from app.schemas.analytics import DashboardStatsResponse

class AnalyticsService:
    @staticmethod
    def get_dashboard_stats(db: Session) -> dict:
        return InventoryService.get_dashboard_stats(db)

    @staticmethod
    def get_monthly_revenue(db: Session, months: int = 6) -> list:
        return InventoryService.get_monthly_revenue(db, months)

