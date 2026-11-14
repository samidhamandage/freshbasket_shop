from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.dependencies import get_current_admin_user
from app.models.user import User
from app.schemas.product import ProductResponse
from app.schemas.analytics import BestSellerItem
from app.services.inventory_service import InventoryService

router = APIRouter(prefix="/api/admin/inventory", tags=["Admin Inventory"])

@router.get("/low-stock", response_model=List[ProductResponse])
def get_low_stock(
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    return InventoryService.get_low_stock_products(db)

@router.get("/best-sellers", response_model=List[BestSellerItem])
def get_best_sellers(
    limit: int = Query(10, ge=1, le=50),
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    return InventoryService.get_best_selling(db, limit)

