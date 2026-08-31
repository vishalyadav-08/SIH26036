"""Role-based access control (AUTH-003).

Browser clients are untrusted and their route guards are UX only — these
classes are where authorization is actually decided (ARCHITECTURE.md §10).

Role is the coarse gate. Ownership and assignment are finer checks that depend
on domain records, so they belong in each module's services rather than here.
"""

from rest_framework.permissions import BasePermission

from authentication.models import User


class HasRole(BasePermission):
    """Base class: subclasses set `allowed_roles`."""

    allowed_roles: tuple[str, ...] = ()

    def has_permission(self, request, view):
        user = request.user

        if not user or not user.is_authenticated:
            return False

        return user.role in self.allowed_roles


class IsAdmin(HasRole):
    allowed_roles = (User.Role.ADMIN,)


class IsOfficer(HasRole):
    allowed_roles = (User.Role.OFFICER,)


class IsBusiness(HasRole):
    allowed_roles = (User.Role.BUSINESS,)


class IsAdminOrOfficer(HasRole):
    allowed_roles = (User.Role.ADMIN, User.Role.OFFICER)


class IsBusinessOrAdmin(HasRole):
    """Registry and request actions: the owner acts, an admin may act for them."""

    allowed_roles = (User.Role.BUSINESS, User.Role.ADMIN)
