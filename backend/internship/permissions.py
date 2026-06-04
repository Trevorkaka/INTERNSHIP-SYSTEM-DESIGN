from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_admin


class IsAdminOrSelf(BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user.is_admin or obj == request.user

  
    














class IsStudent(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_student


class IsAcademicSupervisor(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_academic_supervisor


class IsWorkplaceSupervisor(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_workplace_supervisor


class IsAdminOrAcademicSupervisor(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_admin or request.user.is_academic_supervisor
        )


class IsAdminOrAnySupervisor(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_admin or
            request.user.is_academic_supervisor or
            request.user.is_workplace_supervisor
        )


class IsAdminOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return request.user.is_authenticated
        return request.user.is_authenticated and request.user.is_admin


class IsOwnerOrSupervisorOrAdmin(BasePermission):
    """
    Used for logbook entries: the student who owns it, their supervisors,
    or an admin can access the object.
    """
    def has_object_permission(self, request, view, obj):
        user = request.user
        if user.is_admin:
            return True
        # obj is a LogbookEntry; obj.placement links to student
        student_user = obj.placement.student.user
        if student_user == user:
            return True
        if user.is_academic_supervisor:
            return obj.placement.student.academic_supervisor == user
        if user.is_workplace_supervisor:
            return obj.placement.workplace_supervisor == user
        return False
