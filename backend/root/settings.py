"""
Django settings for the MapanSetu API (SIH26036).

Canonical contract: docs/API_CONTRACT.md — base path /api/v1.
Frozen decisions this file implements: ADR-005 (PostgreSQL), ADR-007 (MinIO),
ADR-008 (JWT), ADR-009 (Argon2id).
"""

import os
from datetime import timedelta
from pathlib import Path

import dj_database_url
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")

# Email ---------------------------------------------------------------------

DEFAULT_FROM_EMAIL = os.getenv("DEFAULT_FROM_EMAIL", "no-reply@mapansetu.test")
EMAIL_BACKEND = os.getenv(
    "EMAIL_BACKEND",
    "django.core.mail.backends.console.EmailBackend",
)
EMAIL_HOST = os.getenv("EMAIL_HOST")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", 587))
EMAIL_USE_TLS = os.getenv("EMAIL_USE_TLS", "True") == "True"
EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER")
EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD")

# Google sign-in -------------------------------------------------------------
# External identity is an extension point (ARCHITECTURE.md section 12). Leave
# the client id unset and the endpoint reports itself unavailable rather than
# half-working.

GOOGLE_OAUTH_CLIENT_ID = os.getenv("GOOGLE_OAUTH_CLIENT_ID")

# Certificate signing (ADR-011, CRYPTOGRAPHY.md section 6) --------------------
# Prototype key material, injected through environment configuration and
# labelled non-production. The private key is never committed or logged.
# Production requires a managed key store / HSM.

CERTIFICATE_PRIVATE_KEY = os.getenv("CERTIFICATE_PRIVATE_KEY", "").replace("\\n", "\n")
CERTIFICATE_PUBLIC_KEY = os.getenv("CERTIFICATE_PUBLIC_KEY", "").replace("\\n", "\n")

# Core ----------------------------------------------------------------------

SECRET_KEY = os.getenv("SECRET_KEY", "django-insecure-change-me-before-any-deployment")

DEBUG = os.getenv("DEBUG", "True") == "True"

ALLOWED_HOSTS = [h for h in os.getenv("ALLOWED_HOSTS", "localhost,127.0.0.1").split(",") if h]

AUTH_USER_MODEL = "authentication.User"

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # Third party
    "corsheaders",
    "rest_framework",
    "rest_framework_simplejwt",
    "rest_framework_simplejwt.token_blacklist",
    "drf_spectacular",
    # MapanSetu domain modules (see docs/ARCHITECTURE.md §3)
    "common",
    "authentication",
    "businesses",
    "instruments",
    "applications",
    "scheduling",
    "inspections",
    "evidence",
    "certificates",
    "verification",
    "notifications",
    "audit",
    "sync",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "root.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "root.wsgi.application"

# Database ------------------------------------------------------------------
# PostgreSQL is the system of record (ADR-005). SQLite is only a fallback so a
# fresh clone runs before anyone has Postgres up.

DATABASES = {
    "default": dj_database_url.config(
        env="DATABASE_URI",
        default=f"sqlite:///{BASE_DIR / 'db.sqlite3'}",
        conn_health_checks=True,
    )
}

# Passwords -----------------------------------------------------------------
# Argon2id is required by ADR-009, so it must be first in the list.

PASSWORD_HASHERS = [
    "django.contrib.auth.hashers.Argon2PasswordHasher",
    "django.contrib.auth.hashers.PBKDF2PasswordHasher",
]

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# Internationalization ------------------------------------------------------

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

# Static and media ----------------------------------------------------------

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

# Where uploads land when object storage is not configured (see below).
# Files are never served from here directly: /api/v1/evidence/{id}/file/
# checks access on every request.
MEDIA_URL = "media/"
# Overridable so a throwaway database run (seed checks, CI) can point its
# files somewhere throwaway too.
MEDIA_ROOT = Path(os.getenv("MEDIA_ROOT", BASE_DIR / "media"))

# Per-item evidence limit (DATA_MODEL.md "Evidence limits"). Prototype value.
EVIDENCE_MAX_BYTES = 10 * 1024 * 1024

# DEMO/CONFIGURABLE (ADR-016): an inspection needs at least one evidence item
# before a decision can be recorded. Off only for environments that have no
# way to attach files.
INSPECTION_REQUIRE_EVIDENCE = os.getenv("INSPECTION_REQUIRE_EVIDENCE", "false" if DEBUG else "true").lower() in (
    "1", "true", "yes",
)

# Object storage (ADR-007) --------------------------------------------------
# Evidence images and certificate PDFs go to MinIO via the S3 API. Left on the
# local filesystem until MINIO_ENDPOINT is set, so nothing breaks before the
# container is running.

MINIO_ENDPOINT = os.getenv("MINIO_ENDPOINT")

if MINIO_ENDPOINT:
    STORAGES = {
        "default": {
            "BACKEND": "storages.backends.s3.S3Storage",
            "OPTIONS": {
                "endpoint_url": MINIO_ENDPOINT,
                "access_key": os.getenv("MINIO_ACCESS_KEY"),
                "secret_key": os.getenv("MINIO_SECRET_KEY"),
                "bucket_name": os.getenv("MINIO_BUCKET", "mapansetu"),
                "default_acl": None,
                "querystring_auth": True,
            },
        },
        "staticfiles": {"BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage"},
    }

# CORS ----------------------------------------------------------------------
# Web portal and field PWA are separate origins; both send the auth cookie.

CORS_ALLOWED_ORIGINS = [
    o for o in os.getenv(
        "CORS_ALLOWED_ORIGINS",
        "http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000,http://127.0.0.1:3001",
    ).split(",") if o
]

CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^http://localhost:\d+$",
    r"^http://127\.0\.0\.1:\d+$",
]

CORS_ALLOW_CREDENTIALS = True

# DRF -----------------------------------------------------------------------

REST_FRAMEWORK = {
    # Bearer token in the Authorization header, per ARCHITECTURE.md section 7.
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": ("rest_framework.permissions.IsAuthenticated",),
    "EXCEPTION_HANDLER": "common.exceptions.exception_handler",
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "DEFAULT_THROTTLE_CLASSES": ("rest_framework.throttling.ScopedRateThrottle",),
    # Public certificate verification is unauthenticated (ADR-017), so it is
    # rate-limited by scope rather than left open.
    "DEFAULT_THROTTLE_RATES": {
        "public_verify": "30/min",
        "login": "10/min",
        "google_login": "10/min",
        "signup": "5/min",
    },
}

# There is no refresh endpoint yet (ARCHITECTURE.md leaves refresh/logout
# policy open), so a 15-minute access token would silently strand anyone who
# left a tab open — including mid-demo. The prototype uses a long-lived token
# and makes that an explicit, configurable choice rather than a hidden one.
# Production must shorten this and add refresh before any real deployment.
ACCESS_TOKEN_MINUTES = int(os.getenv("ACCESS_TOKEN_MINUTES", 480))

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=ACCESS_TOKEN_MINUTES),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "UPDATE_LAST_LOGIN": True,
}

SPECTACULAR_SETTINGS = {
    "TITLE": "MapanSetu API",
    "DESCRIPTION": "Verification lifecycle for weighing and measuring instruments (SIH26036 prototype).",
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
    "SCHEMA_PATH_PREFIX": "/api/v1",
}

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
