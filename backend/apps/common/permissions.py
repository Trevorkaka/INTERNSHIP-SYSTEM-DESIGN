from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and getattr(request.user, "role", None) == "admin"


class IsAdminUserRole(BasePermission):
    """
    Custom permission to allow only users with role 'admin'.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and getattr(request.user, "role", None) == "admin"


class IsAdminOrSelf(BasePermission):
    def has_object_permission(self, request, view, obj):
        # Supports CustomUser or other objects that have a 'user' property or are user themselves
        user_obj = getattr(obj, "user", obj)
        return request.user.is_admin or user_obj == request.user


class IsStudent(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and getattr(request.user, "role", None) == "student"


class IsAcademicSupervisor(BasePermission):
    """
    Allows only academic supervisors to perform evaluation actions.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and getattr(request.user, "role", None) == "academic_supervisor"


class IsWorkplaceSupervisor(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and getattr(request.user, "role", None) == "workplace_supervisor"


class IsAdminOrAcademicSupervisor(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            getattr(request.user, "role", None) == "admin" or
            getattr(request.user, "role", None) == "academic_supervisor"
        )


class IsAdminOrAnySupervisor(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            getattr(request.user, "role", None) == "admin" or
            getattr(request.user, "role", None) == "academic_supervisor" or
            getattr(request.user, "role", None) == "workplace_supervisor"
        )


class IsAdminOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return request.user.is_authenticated
        return request.user.is_authenticated and getattr(request.user, "role", None) == "admin"


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

        # Handle both WeeklyLog models (monolithic has student, modular has placement)
        student_user = None
        workplace_supervisor_user = None
        academic_supervisor_user = None

        if hasattr(obj, "student"):
            student_user = obj.student.user
            # In the monolithic model, student relates to supervisor via academic_supervisor and work_place_supervisor on Student model
            academic_supervisor_user = obj.student.academic_supervisor
            workplace_supervisor_user = obj.student.work_place_supervisor
        elif hasattr(obj, "placement"):
            student_user = obj.placement.student
            academic_supervisor_user = obj.placement.academic_supervisor
            workplace_supervisor_user = obj.placement.workplace_supervisor

        if role == 'student':
            return student_user == user

        if role == 'workplace_supervisor':
            return workplace_supervisor_user == user

        if role == 'academic_supervisor':
            return academic_supervisor_user == user

        if role == 'admin':
            return True

        return False
