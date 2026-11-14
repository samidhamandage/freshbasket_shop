import time
import secrets
from datetime import datetime, timezone

def generate_cuid() -> str:
    """Generate a 25-character cuid-like string compatible with existing DB records."""
    t = int(time.time() * 1000)
    chars = "0123456789abcdefghijklmnopqrstuvwxyz"
    t_str = ""
    while t > 0:
        t_str = chars[t % 36] + t_str
        t //= 36
    rnd = secrets.token_hex(8)
    return f"c{t_str}{rnd}"[:25]

def utc_now() -> datetime:
    """Return current UTC datetime without timezone for PostgreSQL timestamp without tz."""
    return datetime.now(timezone.utc).replace(tzinfo=None)

def serialize_utc_datetime(dt: datetime | None) -> str | None:
    """Return ISO 8601 string with trailing 'Z' representing UTC datetime."""
    if dt is None:
        return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.isoformat().replace("+00:00", "Z")

