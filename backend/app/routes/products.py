from typing import Optional, List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.product import ProductResponse
from app.services.product_service import ProductService

router = APIRouter(prefix="/api/products", tags=["Products"])

@router.get("", response_model=List[ProductResponse])
def get_products(
    category: Optional[str] = Query(None, description="Category slug"),
    featured: Optional[bool] = Query(None, description="Filter featured products"),
    search: Optional[str] = Query(None, description="Search query"),
    limit: int = Query(20, ge=1, le=100),
    skip: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    return ProductService.get_products(
        db=db,
        category_slug=category,
        featured=featured,
        search=search,
        limit=limit,
        skip=skip
    )

@router.get("/{slug}", response_model=ProductResponse)
def get_product(
    slug: str,
    db: Session = Depends(get_db)
):
    return ProductService.get_product_by_slug(db, slug)

