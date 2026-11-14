from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.session import get_db
from app.schemas.review import ReviewCreate, ReviewResponse
from app.utils.helpers import serialize_utc_datetime
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.product import Product
from app.models.review import Review

router = APIRouter(prefix="/api/reviews", tags=["Reviews"])

@router.post("", status_code=status.HTTP_201_CREATED)
def create_review(
    data: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(Product.id == data.productId).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    existing = db.query(Review).filter(
        Review.userId == current_user.id,
        Review.productId == data.productId
    ).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You already reviewed this product")

    review = Review(
        userId=current_user.id,
        productId=data.productId,
        rating=data.rating,
        comment=data.comment
    )
    db.add(review)
    db.commit()
    db.refresh(review)

    # Recalculate average rating & review count
    stats = db.query(
        func.avg(Review.rating),
        func.count(Review.id)
    ).filter(Review.productId == data.productId).first()

    product.rating = float(stats[0] or 0.0)
    product.reviewCount = int(stats[1] or 0)
    db.commit()

    return {
        "review": {
            "id": review.id,
            "userId": review.userId,
            "productId": review.productId,
            "rating": review.rating,
            "comment": review.comment,
            "createdAt": serialize_utc_datetime(review.createdAt),
            "user": {
                "name": current_user.name,
                "image": current_user.image
            }
        }
    }

