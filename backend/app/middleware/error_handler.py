import logging
from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

logger = logging.getLogger("freshbasket.error")

async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    errors = exc.errors()
    # Extract the first user-friendly error message
    msg = errors[0].get("msg") if errors else "Invalid request data"
    # If pydantic prefixed with "Value error, ", remove it
    if msg.startswith("Value error, "):
        msg = msg[len("Value error, "):]
    logger.warning(f"Validation error on {request.url.path}: {msg}")
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"error": msg, "detail": jsonable_encoder(errors)}
    )

async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    detail = exc.detail
    # If detail is string, return error: detail for backwards compatibility with Next.js frontend
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": detail if isinstance(detail, str) else "Error", "detail": detail}
    )

async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.error(f"Unhandled server error on {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"error": "An unexpected server error occurred. Please try again later."}
    )
