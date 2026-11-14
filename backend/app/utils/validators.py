import re

NAME_REGEX = re.compile(r"^[A-Za-z\s]+$")
UPPERCASE_REGEX = re.compile(r"[A-Z]")
DIGIT_REGEX = re.compile(r"[0-9]")
SPECIAL_CHAR_REGEX = re.compile(r"[!@#$%^&*(),.?\":{}|<>_\-+=\[\]\\/'`~]")

def validate_full_name(name: str) -> None:
    if not name or len(name.strip()) < 2:
        raise ValueError("Full Name must be at least 2 characters.")
    if not NAME_REGEX.match(name.strip()):
        raise ValueError("Full Name must contain only alphabetic letters and spaces.")

def validate_password_strength(password: str) -> None:
    if not password or len(password) < 8:
        raise ValueError("Password must be at least 8 characters long.")
    if not UPPERCASE_REGEX.search(password):
        raise ValueError("Password must contain at least one uppercase letter.")
    if not DIGIT_REGEX.search(password):
        raise ValueError("Password must contain at least one number.")
    if not SPECIAL_CHAR_REGEX.search(password):
        raise ValueError("Password must contain at least one special character.")

def generate_slug(text: str) -> str:
    cleaned = re.sub(r"[^\w\s-]", "", text.lower())
    return re.sub(r"[-\s]+", "-", cleaned).strip("-")

