from rest_framework.permissions import BasePermission


class IsAdminUserRole(BasePermission):
    """
    Custom permission to allow only users with role 'admin'.

    Why not use Django's is_staff?
    - We are implementing domain-specific RBAC (role-based access control)
    """

    def has_permission(self, request, view):
        """
        Checks if the requesting user is authenticated
        and has the 'admin' role.
        """
        return (
                request.user.is_authenticated and
                getattr(request.user, "role", None) == "admin"
        )


class IsAcademicSupervisor(BasePermission):
    """
    Allows only academic supervisors to perform evaluation actions.
    """

    def has_permission(self, request, view):
        return (
                request.user.is_authenticated and
                getattr(request.user, "role", None) == "academic_supervisor"
        )



class IsRelatedToWeeklyLog(BasePermission):
    """
    Object-level permission for WeeklyLog access.

    Ensures users only access logs related to them.
    """

    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        user = request.user
        role = getattr(user, "role", None)

        if role == 'student':
            return obj.placement.student == user

        if role == 'workplace_supervisor':
            return obj.placement.workplace_supervisor == user

        if role == 'academic_supervisor':
            return obj.placement.academic_supervisor == user

        if role == 'admin':
            return True

        return False