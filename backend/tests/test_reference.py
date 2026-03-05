import re

from domain.booking.reference import generate_reference


def test_generate_reference_is_urlsafe_and_high_entropy() -> None:
    reference = generate_reference()
    assert re.fullmatch(r"[A-Za-z0-9_-]+", reference)
    assert len(reference) >= 22
