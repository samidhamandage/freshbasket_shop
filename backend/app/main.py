import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.config import settings
from app.core.cron import start_keep_alive_job
from app.middleware.error_handler import (
    validation_exception_handler,
    http_exception_handler,
    generic_exception_handler
)
from app.routes import (
    auth_router,
    products_router,
    categories_router,
    coupons_router,
    orders_router,
    reviews_router,
    recommendations_router,
    payments_router,
    webhooks_router,
    admin_router,
)
from app.sockets.socket_manager import socket_app

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("freshbasket")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Start the 14-minute keep-alive cron job
    cron_task = asyncio.create_task(start_keep_alive_job())
    yield
    # Clean shutdown
    cron_task.cancel()
    try:
        await cron_task
    except asyncio.CancelledError:
        pass

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan
)

# Exception handlers
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)

# CORS Middleware
origins = [
    settings.FRONTEND_URL,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
if getattr(settings, "CORS_ORIGINS", None):
    origins.extend([orig.strip() for orig in settings.CORS_ORIGINS.split(",") if orig.strip()])

origins = list(dict.fromkeys(filter(None, origins)))

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"^https://.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(auth_router)
app.include_router(products_router)
app.include_router(categories_router)
app.include_router(coupons_router)
app.include_router(orders_router)
app.include_router(reviews_router)
app.include_router(recommendations_router)
app.include_router(payments_router)
app.include_router(webhooks_router)
app.include_router(admin_router)

# Mount Socket.IO application
app.mount("/api/socket", socket_app)
app.mount("/socket.io", socket_app)

@app.get("/", tags=["Health"])
def root():
    return {
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "healthy",
        "docs": "/docs"
    }

@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=False)

