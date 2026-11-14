from fastapi import APIRouter
from app.routes.admin.stats import router as stats_router
from app.routes.admin.products import router as products_router
from app.routes.admin.users import router as users_router
from app.routes.admin.inventory import router as inventory_router

admin_router = APIRouter()
admin_router.include_router(stats_router)
admin_router.include_router(products_router)
admin_router.include_router(users_router)
admin_router.include_router(inventory_router)

__all__ = ["admin_router"]

