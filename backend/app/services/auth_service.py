from typing import Tuple, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.user import User
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse, UserResponse
from app.core.security import verify_password, get_password_hash
from app.core.jwt import create_access_token, create_refresh_token, decode_token
from app.utils.validators import validate_full_name, validate_password_strength

class AuthService:
    @staticmethod
    def register_user(db: Session, data: RegisterRequest) -> Tuple[User, TokenResponse]:
        # Validate rules explicitly
        validate_full_name(data.name)
        validate_password_strength(data.password)

        normalized_email = data.email.lower().strip()
        existing = db.query(User).filter(User.email == normalized_email).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists."
            )

        hashed_password = get_password_hash(data.password)
        new_user = User(
            name=data.name.strip(),
            email=normalized_email,
            password=hashed_password,
            role="USER",
            blocked=False
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        # Generate tokens for automatic login upon signup
        token_data = {
            "sub": new_user.id,
            "email": new_user.email,
            "role": new_user.role,
            "name": new_user.name
        }
        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)

        user_resp = UserResponse.model_validate(new_user)
        token_resp = TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            user=user_resp
        )
        return new_user, token_resp

    @staticmethod
    def authenticate_user(db: Session, data: LoginRequest) -> Tuple[User, TokenResponse]:
        normalized_email = data.email.lower().strip()
        user = db.query(User).filter(User.email == normalized_email).first()
        if not user or not user.password:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password."
            )

        if user.blocked:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your account has been deactivated. Please contact support."
            )

        if not verify_password(data.password, user.password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password."
            )

        token_data = {
            "sub": user.id,
            "email": user.email,
            "role": user.role,
            "name": user.name
        }
        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)

        user_resp = UserResponse.model_validate(user)
        token_resp = TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            user=user_resp
        )
        return user, token_resp

    @staticmethod
    def refresh_user_token(db: Session, refresh_token: str) -> TokenResponse:
        payload = decode_token(refresh_token)
        if not payload or payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired refresh token."
            )
        user_id = payload.get("sub")
        user = db.query(User).filter(User.id == user_id).first()
        if not user or user.blocked:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or blocked."
            )
        token_data = {
            "sub": user.id,
            "email": user.email,
            "role": user.role,
            "name": user.name
        }
        new_access_token = create_access_token(token_data)
        new_refresh_token = create_refresh_token(token_data)

        user_resp = UserResponse.model_validate(user)
        return TokenResponse(
            access_token=new_access_token,
            refresh_token=new_refresh_token,
            token_type="bearer",
            user=user_resp
        )

