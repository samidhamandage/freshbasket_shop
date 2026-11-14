from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.session import get_db
from app.models.category import Category
from app.models.product import Product
from app.schemas.category import CategoryResponse

router = APIRouter(prefix="/api/categories", tags=["Categories"])

@router.get("", response_model=List[CategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    categories = db.query(Category).order_by(Category.name.asc()).all()
    # Compute product counts
    counts = dict(
        db.query(Product.categoryId, func.count(Product.id)).group_by(Product.categoryId).all()
    )
    result = []
    for cat in categories:
        cat_dict = CategoryResponse.model_validate(cat)
        cat_dict.productCount = counts.get(cat.id, 0)
        result.append(cat_dict)
    return result

