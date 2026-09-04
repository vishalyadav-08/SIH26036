"""Certificate signing and verification (CRYPTOGRAPHY.md sections 3-6).

RSA 2048 with RSA-PSS padding and SHA-256. The private key is backend-only:
never committed, never logged, never returned by the API, never placed in
object storage as ordinary data.

The correct operation is "verify the signature using the public key" — never
"decrypt the signature".
"""

import base64

from cryptography.exceptions import InvalidSignature
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding, rsa
from django.conf import settings

PSS_PADDING = padding.PSS(
    mgf=padding.MGF1(hashes.SHA256()), salt_length=padding.PSS.MAX_LENGTH
)


def generate_keypair():
    """Prototype key generation. Production requires managed custody/HSM."""
    private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)

    private_pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption(),
    ).decode()

    public_pem = private_key.public_key().public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo,
    ).decode()

    return private_pem, public_pem


def _load_private_key():
    pem = settings.CERTIFICATE_PRIVATE_KEY

    if not pem:
        raise RuntimeError(
            "CERTIFICATE_PRIVATE_KEY is not configured; certificate signing is unavailable."
        )

    return serialization.load_pem_private_key(pem.encode(), password=None)


def _load_public_key():
    pem = settings.CERTIFICATE_PUBLIC_KEY

    if not pem:
        # Derive it from the private key rather than failing: verification must
        # keep working when only the private key is configured.
        return _load_private_key().public_key()

    return serialization.load_pem_public_key(pem.encode())


def sign_payload(canonical_bytes):
    """Sign canonical bytes, returning a base64 signature."""
    signature = _load_private_key().sign(canonical_bytes, PSS_PADDING, hashes.SHA256())

    return base64.b64encode(signature).decode()


def verify_payload(canonical_bytes, signature_b64):
    """Verify a signature over canonical bytes using the public key."""
    try:
        _load_public_key().verify(
            base64.b64decode(signature_b64), canonical_bytes, PSS_PADDING, hashes.SHA256()
        )

        return True
    except (InvalidSignature, ValueError, TypeError):
        # Any malformed or non-matching signature is simply "not verified".
        return False
