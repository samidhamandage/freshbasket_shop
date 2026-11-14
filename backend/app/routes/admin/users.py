from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.session import get_db
from app.core.dependencies import get_current_admin_user
from app.models.user import User
from app.models.order import Order
from app.schemas.user import UserAdminView, UserUpdate, UserCountSummary

router = APIRouter(prefix="/api/admin/users", tags=["Admin Users"])

@router.get("", response_model=List[UserAdminView])
def get_admin_users(
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    users = db.query(User).filter(User.role != "ADMIN").order_by(User.createdAt.desc()).all()

    # Get order counts and total spent
    order_data = db.query(
        Order.userId,
        func.count(Order.id).label("order_count"),
        func.coalesce(func.sum(Order.total), 0.0).label("total_spent")
    ).group_by(Order.userId).all()

    stats_map = {row[0]: (int(row[1]), float(row[2])) for row in order_data}

    result = []
    for u in users:
        u_view = UserAdminView.model_validate(u)
        counts = stats_map.get(u.id, (0, 0.0))
        u_view.orderCount = counts[0]
        u_view.totalSpent = counts[1]
        u_view.count_ = UserCountSummary(orders=counts[0])
        result.append(u_view)
    return result

@router.patch("/{user_id}", response_model=UserAdminView)
def update_user(
    user_id: str,
    data: UserUpdate,
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if target_user.role == "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin accounts cannot be managed or blocked"
        )

    update_dict = data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(target_user, key, value)

    db.commit()
    db.refresh(target_user)
    return target_user

