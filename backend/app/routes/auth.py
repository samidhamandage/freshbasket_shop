from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse, UserResponse, RefreshTokenRequest
from app.services.auth_service import AuthService
from app.core.dependencies import get_current_user, get_optional_user
from app.models.user import User

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(
    data: RegisterRequest,
    response: Response,
    db: Session = Depends(get_db)
):
    user, token_resp = AuthService.register_user(db, data)
    # Set freshbasket_token cookie for cookie-based browser sessions
    response.set_cookie(
        key="freshbasket_token",
        value=token_resp.access_token,
        httponly=True,
        samesite="lax",
        max_age=86400 * 7,
        secure=False
    )
    return token_resp

@router.post("/login", response_model=TokenResponse)
def login(
    data: LoginRequest,
    response: Response,
    db: Session = Depends(get_db)
):
    user, token_resp = AuthService.authenticate_user(db, data)
    response.set_cookie(
        key="freshbasket_token",
        value=token_resp.access_token,
        httponly=True,
        samesite="lax",
        max_age=86400 * 7,
        secure=False
    )
    return token_resp

@router.post("/refresh", response_model=TokenResponse)
def refresh_token(
    data: RefreshTokenRequest,
    db: Session = Depends(get_db)
):
    return AuthService.refresh_user_token(db, data.refresh_token)

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(key="freshbasket_token")
    return {"message": "Logged out successfully"}

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(
    current_user: User = Depends(get_current_user)
):
    return current_user

@router.get("/session")
def get_session(
    current_user: User = Depends(get_optional_user)
):
    """NextAuth session compatibility endpoint."""
    if not current_user:
        return {}
    return {
        "user": {
            "id": current_user.id,
            "name": current_user.name,
            "email": current_user.email,
            "role": current_user.role,
            "image": current_user.image,
            "phone": current_user.phone
        },
        "expires": "2099-01-01T00:00:00.000Z"
    }

@router.get("/error")
def auth_error():
    from fastapi.responses import RedirectResponse
    return RedirectResponse(url="/auth/login")

