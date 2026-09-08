from django.contrib.auth.base_user import BaseUserManager


class UserManager(BaseUserManager):
    """Email is the identifier for MapanSetu accounts; there is no username.

    Email is stored lowercased in full, not just the domain part that Django's
    `normalize_email` folds. The data model requires uniqueness on the
    *normalized* email, so two accounts differing only in capitalisation must
    collide at the database level rather than only in application code.
    """

    use_in_migrations = True

    def normalize_email(self, email):
        return super().normalize_email(email).lower()

    def _create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError("Email is required")

        email = self.normalize_email(email)

        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.full_clean(exclude=["password"])
        user.save(using=self._db)

        return user

    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)

        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)
        extra_fields.setdefault("role", self.model.Role.ADMIN)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must be a staff member")

        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True")

        return self._create_user(email, password, **extra_fields)
