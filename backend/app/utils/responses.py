from typing import Any, Optional
from fastapi.responses import JSONResponse

def success_response(data: Any, message: Optional[str] = None, status_code: int = 200) -> JSONResponse:
    content = {"success": True, "data": data}
    if message:
        content["message"] = message
    return JSONResponse(status_code=status_code, content=content)

def error_response(message: str, status_code: int = 400) -> JSONResponse:
    return JSONResponse(status_code=status_code, content={"error": message})

