import re
import secrets

_URLSAFE_RE = re.compile(r"^[A-Za-z0-9_-]+$")


def generate_reference() -> str:
    reference = secrets.token_urlsafe(16)
    if not _URLSAFE_RE.match(reference):
        raise ValueError("Generated reference is not URL-safe")
    return reference
