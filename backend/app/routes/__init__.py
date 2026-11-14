from app.routes.auth import router as auth_router
from app.routes.products import router as products_router
from app.routes.categories import router as categories_router
from app.routes.coupons import router as coupons_router
from app.routes.orders import router as orders_router
from app.routes.reviews import router as reviews_router
from app.routes.recommendations import router as recommendations_router
from app.routes.payments import router as payments_router
from app.routes.webhooks import router as webhooks_router
from app.routes.admin import admin_router

__all__ = [
    "auth_router",
    "products_router",
    "categories_router",
    "coupons_router",
    "orders_router",
    "reviews_router",
    "recommendations_router",
    "payments_router",
    "webhooks_router",
    "admin_router",
]

