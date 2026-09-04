"""One-time dev helper: generates an RSA keypair for certificate signing
(CRYPTOGRAPHY.md section 6) and writes it to backend/.env.

Run once, after installing requirements: python generate_cert_keys.py
"""
from pathlib import Path

from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa

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

env_path = Path(__file__).resolve().parent / ".env"

with open(env_path, "a") as f:
    f.write(f'CERTIFICATE_PRIVATE_KEY="{private_pem.replace(chr(10), chr(92) + "n")}"\n')
    f.write(f'CERTIFICATE_PUBLIC_KEY="{public_pem.replace(chr(10), chr(92) + "n")}"\n')

print(f"Wrote CERTIFICATE_PRIVATE_KEY and CERTIFICATE_PUBLIC_KEY to {env_path}")
