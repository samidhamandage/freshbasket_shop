import json
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
from jose import jwt, JWTError, jwe
from cryptography.hazmat.primitives.kdf.hkdf import HKDF
from cryptography.hazmat.primitives import hashes
from app.core.config import settings

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "type": "access"})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: Dict[str, Any]) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt

def decode_token(token: str) -> Optional[Dict[str, Any]]:
    # 1. NextAuth JWE token (starts with eyJhbGciOiJkaXIi -> dir + A256GCM)
    if token and token.startswith("eyJhbGciOiJkaXIi"):
        secret_keys = [
            getattr(settings, "NEXTAUTH_SECRET", None),
            settings.SECRET_KEY,
            "freshbasket-secret-key-32characterslongmin123456"
        ]
        for s in secret_keys:
            if not s:
                continue
            try:
                hkdf = HKDF(
                    algorithm=hashes.SHA256(),
                    length=32,
                    salt=b"",
                    info=b"NextAuth.js Generated Encryption Key"
                )
                derived_key = hkdf.derive(s.encode("utf-8"))
                decrypted = jwe.decrypt(token, derived_key)
                payload = json.loads(decrypted.decode("utf-8"))
                if payload:
                    return payload
            except Exception:
                continue

    # 2. Standard HS256 JWT
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except JWTError:
        return None

