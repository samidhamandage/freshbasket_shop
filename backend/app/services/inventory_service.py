from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, and_, or_
from fastapi import HTTPException, status

from app.models.product import Product
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.user import User
from app.models.inventory_log import InventoryLog

class InventoryService:
    @staticmethod
    def update_stock(db: Session, product_id: str, change: int, reason: str) -> dict:
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

        new_stock = product.stock + change
        if new_stock < 0:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Insufficient stock")

        stock_status = (
            "OUT_OF_STOCK" if new_stock == 0 else "LOW_STOCK" if new_stock < 10 else "IN_STOCK"
        )
        product.stock = new_stock
        product.stockStatus = stock_status

        log = InventoryLog(
            productId=product_id,
            change=change,
            reason=reason,
            stock=new_stock
        )
        db.add(log)
        db.commit()
        db.refresh(product)
        return {"newStock": new_stock, "stockStatus": stock_status}

    @staticmethod
    def get_low_stock_products(db: Session) -> List[Product]:
        return db.query(Product).options(joinedload(Product.category)).filter(
            or_(Product.stockStatus == "LOW_STOCK", Product.stockStatus == "OUT_OF_STOCK")
        ).order_by(Product.stock.asc()).all()

    @staticmethod
    def get_best_selling(db: Session, limit: int = 10) -> List[dict]:
        results = db.query(
            OrderItem.productId,
            func.sum(OrderItem.quantity).label("total_sold")
        ).group_by(OrderItem.productId).order_by(func.sum(OrderItem.quantity).desc()).limit(limit).all()

        product_ids = [r[0] for r in results]
        products = db.query(Product).options(joinedload(Product.category)).filter(Product.id.in_(product_ids)).all()
        prod_map = {p.id: p for p in products}

        output = []
        for pid, sold in results:
            output.append({
                "product": prod_map.get(pid),
                "totalSold": int(sold or 0)
            })
        return output

    @staticmethod
    def get_monthly_revenue(db: Session, months: int = 6) -> List[dict]:
        results = []
        now = datetime.now()

        for i in range(months - 1, -1, -1):
            year = now.year
            month = now.month - i
            while month <= 0:
                month += 12
                year -= 1

            start_dt = datetime(year, month, 1, 0, 0, 0)
            if month == 12:
                end_dt = datetime(year + 1, 1, 1, 0, 0, 0)
            else:
                end_dt = datetime(year, month + 1, 1, 0, 0, 0)

            # Valid completed orders
            rev_query = db.query(
                func.coalesce(func.sum(Order.total), 0.0),
                func.count(Order.id)
            ).filter(
                and_(
                    Order.createdAt >= start_dt,
                    Order.createdAt < end_dt,
                    ~Order.status.in_(["CANCELLED", "REFUNDED"])
                )
            ).first()

            # Refunded orders
            ref_query = db.query(
                func.coalesce(func.sum(Order.total), 0.0),
                func.count(Order.id)
            ).filter(
                and_(
                    Order.createdAt >= start_dt,
                    Order.createdAt < end_dt,
                    Order.status == "REFUNDED"
                )
            ).first()

            revenue_sum = float(rev_query[0] or 0.0)
            order_count = int(rev_query[1] or 0)
            refund_sum = float(ref_query[0] or 0.0)
            refund_count = int(ref_query[1] or 0)

            results.append({
                "month": start_dt.strftime("%b %Y"),
                "revenue": round(revenue_sum, 2),
                "refunded": round(refund_sum, 2),
                "orders": order_count,
                "refundedOrders": refund_count
            })

        return results

    @staticmethod
    def get_inventory_logs(db: Session, product_id: Optional[str] = None, limit: int = 50) -> List[InventoryLog]:
        query = db.query(InventoryLog).options(joinedload(InventoryLog.product))
        if product_id:
            query = query.filter(InventoryLog.productId == product_id)
        return query.order_by(InventoryLog.createdAt.desc()).limit(limit).all()

    @staticmethod
    def get_dashboard_stats(db: Session) -> dict:
        total_rev = db.query(func.coalesce(func.sum(Order.total), 0.0)).filter(
            ~Order.status.in_(["CANCELLED", "REFUNDED"])
        ).scalar() or 0.0

        total_orders = db.query(func.count(Order.id)).scalar() or 0
        total_users = db.query(func.count(User.id)).scalar() or 0
        total_products = db.query(func.count(Product.id)).scalar() or 0

        recent_orders = db.query(Order).options(
            joinedload(Order.items),
            joinedload(Order.user),
            joinedload(Order.trackingHistory)
        ).order_by(Order.createdAt.desc()).limit(10).all()

        status_counts = db.query(
            Order.status,
            func.count(Order.id)
        ).group_by(Order.status).all()

        monthly_rev = InventoryService.get_monthly_revenue(db, 6)

        return {
            "totalRevenue": float(total_rev),
            "totalOrders": int(total_orders),
            "totalUsers": int(total_users),
            "totalProducts": int(total_products),
            "recentOrders": recent_orders,
            "monthlyRevenue": monthly_rev,
            "ordersByStatus": [{"status": s[0], "count": int(s[1])} for s in status_counts]
        }

