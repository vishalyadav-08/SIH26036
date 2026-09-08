"""Test settings.

Django creates and destroys a database per test run. Doing that against Neon
means a schema create/drop over the network for every run — minutes instead of
seconds, and it fails outright if the role cannot create databases. Tests are
about our logic, not the hosting, so they run on in-memory SQLite.

Usage:  manage.py test --settings=root.settings_test
"""

from .settings import *  # noqa: F401,F403

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": ":memory:",
    }
}

# Argon2 is deliberately slow. That is correct in production and pure overhead
# across a suite that creates users constantly.
PASSWORD_HASHERS = ["django.contrib.auth.hashers.MD5PasswordHasher"]
