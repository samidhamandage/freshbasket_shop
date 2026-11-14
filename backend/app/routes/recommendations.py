from typing import Optional, List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.product import ProductResponse
from app.services.recommendation_service import RecommendationService
from app.core.dependencies import get_optional_user
from app.models.user import User

router = APIRouter(prefix="/api/recommendations", tags=["Recommendations"])

@router.get("", response_model=List[ProductResponse])
def get_recommendations(
    productId: Optional[str] = Query(None),
    limit: int = Query(8, ge=1, le=50),
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    user_id = current_user.id if current_user else None
    return RecommendationService.get_recommendations(
        db=db,
        product_id=productId,
        user_id=user_id,
        limit=limit
    )

@router.get("/trending", response_model=List[ProductResponse])
def get_trending(
    limit: int = Query(8, ge=1, le=50),
    db: Session = Depends(get_db)
):
    return RecommendationService.get_trending(db=db, limit=limit)

