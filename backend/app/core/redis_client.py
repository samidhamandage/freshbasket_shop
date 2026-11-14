import json
import time
import logging
from typing import Any, Optional
import redis
from app.core.config import settings

logger = logging.getLogger("freshbasket.redis")

class CacheManager:
    def __init__(self):
        self._redis: Optional[redis.Redis] = None
        self._memory_cache = {}
        try:
            r = redis.from_url(settings.REDIS_URL, decode_responses=True, socket_connect_timeout=1)
            r.ping()
            self._redis = r
            logger.info("Connected to Redis successfully.")
        except Exception as e:
            logger.warning(f"Redis connection failed ({e}). Falling back to in-memory cache.")
            self._redis = None

    def get(self, key: str) -> Optional[Any]:
        if self._redis:
            try:
                val = self._redis.get(key)
                if val:
                    return json.loads(val)
                return None
            except Exception:
                pass
        # Fallback in-memory
        item = self._memory_cache.get(key)
        if item:
            val, expiry = item
            if expiry is None or expiry > time.time():
                return val
            else:
                del self._memory_cache[key]
        return None

    def set(self, key: str, value: Any, ttl: int = 120) -> None:
        val_str = json.dumps(value, default=str)
        if self._redis:
            try:
                self._redis.setex(key, ttl, val_str)
                return
            except Exception:
                pass
        # Fallback in-memory
        expiry = time.time() + ttl if ttl else None
        self._memory_cache[key] = (value, expiry)

    def invalidate(self, pattern: str) -> None:
        if self._redis:
            try:
                keys = self._redis.keys(pattern)
                if keys:
                    self._redis.delete(*keys)
            except Exception:
                pass
        # Fallback in-memory
        prefix = pattern.rstrip("*")
        to_del = [k for k in self._memory_cache.keys() if k.startswith(prefix)]
        for k in to_del:
            del self._memory_cache[k]

cache_manager = CacheManager()

