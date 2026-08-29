# Cryptography and Trust Specification

The primitives in this document are backend/client independent. The current implementation target is Python/Django; the repository includes the `cryptography` package but does not yet include certificate signing code. A framework migration must not change these primitives without a security ADR.

## 1. Scope and limitations

This specification defines prototype integrity, signature, authentication, QR, and audit mechanisms. A valid prototype signature does not constitute an authorized legal signature, statutory approval, or absolute immutability. Production deployment requires authorized PKI/key custody decisions.

## 2. Threat model

Protect against accidental/hostile modification of certificate payloads, forged public lookup results, replayed offline operations, unauthorized API access, leaked credentials, unsafe evidence files, and unnoticed audit alteration. The browser, local device, network, and public verifier are not trusted. Availability attacks, compromised host/root access, and legal authority are outside what these primitives alone can solve.

## 3. Primitives and terminology

- **Integrity:** SHA-256 hash of canonical UTF-8 bytes.
- **Certificate authenticity:** RSA 2048 key with RSA-PSS padding and SHA-256 used for signing and public-key verification.
- **Password storage:** Argon2id; never encryption or reversible storage.
- **API authentication:** JWT access tokens validated by the Django/DRF authentication boundary using the configured SimpleJWT dependency.
- **QR:** ZXing-generated lookup URL; discovery only, not a security proof.

Do not use the phrase “decrypt signature.” The correct operation is “verify the signature using the public key.”

## 4. Certificate payload and canonical serialization

The certificate module builds a versioned payload from stable fields only, for example:

```json
{
  "payloadVersion":"1",
  "certificateNumber":"CERT-DEMO-001",
  "applicationNumber":"APP-DEMO-001",
  "instrumentNumber":"INS-DEMO-001",
  "instrumentType":"ELECTRONIC_SCALE",
  "issuedAt":"2026-09-01T10:30:00Z",
  "validUntil":"2027-09-01T23:59:59Z",
  "inspectionResult":"PASS",
  "demoConfiguration":"SIH-PROTOTYPE"
}
```

The exact payload field set and ordering are versioned by the certificate module. Serialization must be deterministic: UTF-8, stable property ordering, no insignificant whitespace, normalized timestamp format, and explicit null/omission rules. The serialized bytes, not a language-native object representation, are the input to hashing/signing.

## 5. Certificate pipeline

1. Build the canonical certificate payload.
2. Deterministically serialize it.
3. UTF-8 encode the serialization.
4. Calculate `payloadHash = SHA-256(bytes)`.
5. Sign the canonical bytes or the specified digest using RSA-PSS with SHA-256 and RSA 2048, with the implementation choice documented and tested consistently.
6. Store payload version, hash, signature, algorithm, public-key reference, and certificate metadata in PostgreSQL; store PDF in MinIO.
7. Generate a QR using ZXing containing only `https://<frontend-domain>/verify/<certificateNo>`.
8. Public verification loads status and signed payload, recomputes the hash, verifies the signature using the public key, then returns the minimal status response.

`ACTIVE` plus a valid signature returns `VALID`; an otherwise valid signature with expired status returns `EXPIRED`; an administratively revoked certificate returns `REVOKED`; missing, malformed, tampered, or unverifiable material returns `INVALID`.

## 6. Key management

The private key is backend-only, never committed, logged, returned by API, stored in the frontend, or placed in MinIO as ordinary application data. Prototype key material is injected through protected environment/secret configuration and labelled non-production. Public key/reference may be exposed for verification. Production needs a managed key store/HSM, rotation/versioning, access separation, backup/recovery, revocation, and ceremony policy.

## 7. JWT and Argon2id

JWT claims contain only the identity, canonical role, business scope where needed, issue/expiry times, and token identifier required by the security design. Reject expired, malformed, wrong-audience/issuer tokens according to configuration. Do not put passwords or sensitive domain payloads in tokens. Argon2id parameters are centrally configured, reviewed, and never logged.

## 8. QR verification

The QR is an encoded URL for discovery. A scanner or user opens `/verify/:certNo`; the page calls only `GET /api/v1/certificates/verify?certNo={certificateNo}`. Security comes from backend lookup, status, hash recomputation, and signature verification—not from the QR image or an untrusted client calculation.

## 9. Tamper-evident audit chain

Each AuditLog event contains:

`eventId`, `actor`, `action`, `entityType`, `entityId`, `timestamp`, `metadata`, `previousHash`, `currentHash`.

The chain uses:

```text
currentHash = SHA-256(canonical(previousHash + canonicalEventData))
```

`canonicalEventData` has stable field ordering, normalized timestamp, and metadata rules that exclude secrets. Verification checks sequence linkage and recomputation. A mismatch flags tamper evidence; it does not prove when, by whom, or how the alteration happened and does not claim absolute immutability.

## 10. Tamper demonstration

The demo may copy a synthetic certificate payload, change one displayed field, recompute neither the original hash nor signature, and show `INVALID` from the backend verifier. It must not alter production-like data without reset and must label the exercise synthetic.

## 11. Prototype versus production

Prototype guarantees are limited to tested canonicalization, SHA-256 fingerprints, RSA-PSS verification, access control, and audit-chain detection in the controlled environment. Production cryptography requires authorized legal review, key custody, algorithm/parameter policy, secure clock/expiry policy, certificate revocation behavior, incident response, and independent security assessment.

