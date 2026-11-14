from typing import Optional, List
from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException, status, BackgroundTasks
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.product import Product
from app.models.coupon import Coupon
from app.models.inventory_log import InventoryLog
from app.models.tracking_history import TrackingHistory
from app.models.user_interaction import UserInteraction
from app.schemas.order import OrderCreate, OrderStatusUpdate
from app.services.whatsapp_service import send_delivery_notification

class OrderService:
    @staticmethod
    def create_order(db: Session, user_id: str, data: OrderCreate) -> Order:
        if not data.items:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Order items cannot be empty")

        # 1. Verify stock availability
        for item in data.items:
            product = db.query(Product).filter(Product.id == item.productId).first()
            if not product or product.stock < item.quantity:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"{item.name} is out of stock or has insufficient quantity"
                )

        try:
            # 2. Create the Order
            order = Order(
                userId=user_id,
                subtotal=data.subtotal,
                deliveryFee=data.deliveryFee,
                discount=data.discount,
                total=data.total,
                couponCode=data.couponCode,
                shippingName=data.shipping.name,
                shippingEmail=str(data.shipping.email),
                shippingPhone=data.shipping.phone,
                shippingAddress=data.shipping.address,
                shippingCity=data.shipping.city,
                shippingState=data.shipping.state,
                shippingZip=data.shipping.zip,
                paymentStatus="completed",
                status="PLACED",
                whatsappNotified=False
            )
            db.add(order)
            db.flush()  # populate order.id

            # 3. Create OrderItems & update stock
            for item in data.items:
                order_item = OrderItem(
                    orderId=order.id,
                    productId=item.productId,
                    quantity=item.quantity,
                    price=item.price,
                    name=item.name,
                    image=item.image
                )
                db.add(order_item)

                product = db.query(Product).filter(Product.id == item.productId).first()
                if product:
                    new_stock = product.stock - item.quantity
                    stock_status = (
                        "OUT_OF_STOCK" if new_stock == 0 else "LOW_STOCK" if new_stock < 10 else "IN_STOCK"
                    )
                    product.stock = new_stock
                    product.stockStatus = stock_status

                    inv_log = InventoryLog(
                        productId=product.id,
                        change=-item.quantity,
                        reason=f"Order {order.id}",
                        stock=new_stock
                    )
                    db.add(inv_log)

                # Track user interaction
                interaction = UserInteraction(
                    userId=user_id,
                    productId=item.productId,
                    type="purchase"
                )
                db.add(interaction)

            # 4. Create initial TrackingHistory
            tracking = TrackingHistory(
                orderId=order.id,
                status="PLACED",
                note="Order has been placed successfully"
            )
            db.add(tracking)

            # 5. Increment coupon usage if applied
            if data.couponCode:
                coupon = db.query(Coupon).filter(Coupon.code == data.couponCode.upper()).first()
                if coupon:
                    coupon.usedCount += 1

            db.commit()
            db.refresh(order)
            return order

        except HTTPException:
            db.rollback()
            raise
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create order: {str(e)}"
            )

    @staticmethod
    def get_orders(db: Session, user_id: Optional[str] = None, order_status: Optional[str] = None) -> List[Order]:
        query = db.query(Order).options(
            joinedload(Order.items),
            joinedload(Order.user),
            joinedload(Order.trackingHistory)
        )
        if user_id:
            query = query.filter(Order.userId == user_id)
        if order_status:
            query = query.filter(Order.status == order_status)

        return query.order_by(Order.createdAt.desc()).all()

    @staticmethod
    def get_order_by_id(db: Session, order_id: str, user_id: Optional[str] = None, is_admin: bool = False) -> Order:
        order = db.query(Order).options(
            joinedload(Order.items).joinedload(OrderItem.product),
            joinedload(Order.user),
            joinedload(Order.trackingHistory)
        ).filter(Order.id == order_id).first()

        if not order:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

        if not is_admin and user_id and order.userId != user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

        return order

    @staticmethod
    async def update_order_status(
        db: Session,
        order_id: str,
        data: OrderStatusUpdate,
        background_tasks: Optional[BackgroundTasks] = None
    ) -> Order:
        order = db.query(Order).options(
            joinedload(Order.items),
            joinedload(Order.user),
            joinedload(Order.trackingHistory)
        ).filter(Order.id == order_id).first()

        if not order:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

        order.status = data.status
        note_text = data.note or f"Order status updated to {data.status}"
        tracking = TrackingHistory(
            orderId=order.id,
            status=data.status,
            note=note_text
        )
        db.add(tracking)
        db.commit()
        db.refresh(order)

        # Fire-and-forget WhatsApp notification on DELIVERED
        if data.status == "DELIVERED" and not order.whatsappNotified:
            phone = (order.user.phone if order.user and order.user.phone else None) or order.shippingPhone
            raw_name = (order.user.name if order.user and order.user.name else None) or order.shippingName
            user_name = raw_name if raw_name and raw_name != "Admin User" else "FreshBasket Customer"

            if phone:
                if background_tasks:
                    background_tasks.add_task(send_delivery_notification, order.id, phone, user_name)
                else:
                    import asyncio
                    asyncio.create_task(send_delivery_notification(order.id, phone, user_name))

        return order

