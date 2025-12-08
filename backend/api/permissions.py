from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'

class IsManager(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'manager'

class IsStaff(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'staff'

class RBACPermission(BasePermission):
    """
    General RBAC:
    - Admin: full access
    - Manager: read all, edit products only
    - Staff: read-only products
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        role = request.user.role

        if role == 'admin':
            return True  # full access

        if role == 'manager':
            if request.method in SAFE_METHODS:
                return True  # can read all
            # write allowed only on ProductViewSet, will handle in view
            return True

        if role == 'staff':
            # staff can only read
            return request.method in SAFE_METHODS

        return False
