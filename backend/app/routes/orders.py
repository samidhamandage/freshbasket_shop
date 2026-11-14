from typing import List, Optional
from fastapi import APIRouter, Depends, Query, BackgroundTasks, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.order import OrderCreate, OrderResponse, OrderCreateResponse, OrderStatusUpdate
from app.services.order_service import OrderService
from app.core.dependencies import get_current_user, get_current_admin_user
from app.models.user import User
from app.sockets.socket_manager import emit_order_updated

router = APIRouter(prefix="/api/orders", tags=["Orders"])

@router.post("", response_model=OrderCreateResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    data: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    order = OrderService.create_order(db=db, user_id=current_user.id, data=data)
    return OrderCreateResponse(orderId=order.id, message="Order created")

@router.get("", response_model=List[OrderResponse])
def get_orders(
    status: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_id = None if current_user.role == "ADMIN" else current_user.id
    return OrderService.get_orders(db=db, user_id=user_id, order_status=status)

@router.get("/{order_id}", response_model=OrderResponse)
def get_order_by_id(
    order_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    is_admin = current_user.role == "ADMIN"
    return OrderService.get_order_by_id(
        db=db,
        order_id=order_id,
        user_id=current_user.id,
        is_admin=is_admin
    )

@router.patch("/{order_id}", response_model=OrderResponse)
async def update_order_status(
    order_id: str,
    data: OrderStatusUpdate,
    background_tasks: BackgroundTasks,
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    order = await OrderService.update_order_status(
        db=db,
        order_id=order_id,
        data=data,
        background_tasks=background_tasks
    )

    # Emit Socket.IO event for real-time order tracking
    order_dict = {
        "id": order.id,
        "status": order.status,
        "updatedAt": str(order.updatedAt)
    }
    await emit_order_updated(order_dict)

    return order

