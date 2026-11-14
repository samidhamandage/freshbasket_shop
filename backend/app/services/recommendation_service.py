from datetime import datetime, timedelta
from typing import Optional, List
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from app.models.product import Product
from app.models.order_item import OrderItem
from app.models.user_interaction import UserInteraction

class RecommendationService:
    @staticmethod
    def get_recommendations(
        db: Session,
        product_id: Optional[str] = None,
        user_id: Optional[str] = None,
        limit: int = 8
    ) -> List[Product]:
        try:
            # 1. Product similarity
            if product_id:
                product = db.query(Product).filter(Product.id == product_id).first()
                if product:
                    similar = db.query(Product).options(joinedload(Product.category)).filter(
                        Product.categoryId == product.categoryId,
                        Product.id != product.id,
                        Product.stockStatus != "OUT_OF_STOCK"
                    ).order_by(Product.rating.desc(), Product.reviewCount.desc()).limit(limit).all()

                    if len(similar) >= limit:
                        return similar

                    # Bought together in same orders
                    order_ids_q = db.query(OrderItem.orderId).filter(
                        OrderItem.productId == product_id
                    ).limit(50).all()
                    order_ids = [r[0] for r in order_ids_q]

                    if order_ids:
                        existing_ids = [p.id for p in similar] + [product.id]
                        bought_together = db.query(Product).options(joinedload(Product.category)).join(
                            OrderItem, OrderItem.productId == Product.id
                        ).filter(
                            OrderItem.orderId.in_(order_ids),
                            ~Product.id.in_(existing_ids),
                            Product.stockStatus != "OUT_OF_STOCK"
                        ).order_by(Product.reviewCount.desc()).limit(limit - len(similar)).all()

                        return similar + bought_together

                    return similar

            # 2. User history recommendations
            if user_id:
                interactions = db.query(UserInteraction).options(
                    joinedload(UserInteraction.product)
                ).filter(
                    UserInteraction.userId == user_id
                ).order_by(UserInteraction.createdAt.desc()).limit(20).all()

                if interactions:
                    cat_ids = list({i.product.categoryId for i in interactions if i.product})
                    viewed_ids = [i.productId for i in interactions]

                    recommended = db.query(Product).options(joinedload(Product.category)).filter(
                        Product.categoryId.in_(cat_ids),
                        ~Product.id.in_(viewed_ids),
                        Product.stockStatus != "OUT_OF_STOCK"
                    ).order_by(Product.rating.desc(), Product.reviewCount.desc()).limit(limit).all()

                    if len(recommended) >= limit:
                        return recommended

                    existing_ids = viewed_ids + [p.id for p in recommended]
                    trending = db.query(Product).options(joinedload(Product.category)).filter(
                        ~Product.id.in_(existing_ids),
                        Product.stockStatus != "OUT_OF_STOCK"
                    ).order_by(Product.reviewCount.desc(), Product.rating.desc()).limit(limit - len(recommended)).all()

                    return recommended + trending

            # 3. Default: trending products
            return db.query(Product).options(joinedload(Product.category)).filter(
                Product.stockStatus != "OUT_OF_STOCK"
            ).order_by(Product.reviewCount.desc(), Product.rating.desc()).limit(limit).all()

        except Exception as e:
            # Fallback to featured products
            return db.query(Product).options(joinedload(Product.category)).filter(
                Product.featured == True
            ).limit(limit).all()

    @staticmethod
    def track_interaction(db: Session, user_id: str, product_id: str, interaction_type: str) -> None:
        try:
            interaction = UserInteraction(
                userId=user_id,
                productId=product_id,
                type=interaction_type
            )
            db.add(interaction)
            db.commit()
        except Exception:
            db.rollback()

    @staticmethod
    def get_trending(db: Session, limit: int = 8) -> List[Product]:
        thirty_days_ago = datetime.now() - timedelta(days=30)
        try:
            trending_q = db.query(
                Product,
                func.count(UserInteraction.id).label("interaction_count")
            ).join(
                UserInteraction, UserInteraction.productId == Product.id
            ).options(
                joinedload(Product.category)
            ).filter(
                Product.stockStatus != "OUT_OF_STOCK",
                UserInteraction.createdAt >= thirty_days_ago
            ).group_by(Product.id).order_by(func.count(UserInteraction.id).desc()).limit(limit).all()

            trending_products = [p[0] for p in trending_q]
            if len(trending_products) < limit:
                existing_ids = [p.id for p in trending_products]
                filler = db.query(Product).options(joinedload(Product.category)).filter(
                    ~Product.id.in_(existing_ids),
                    Product.stockStatus != "OUT_OF_STOCK"
                ).order_by(Product.rating.desc(), Product.reviewCount.desc()).limit(limit - len(trending_products)).all()
                return trending_products + filler

            return trending_products
        except Exception:
            return db.query(Product).options(joinedload(Product.category)).order_by(
                Product.rating.desc()
            ).limit(limit).all()

