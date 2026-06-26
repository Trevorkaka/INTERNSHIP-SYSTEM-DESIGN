"""
Permissions module for the Common application.

This module provides custom DRF BasePermission classes to enforce role-based access
control (RBAC) across various API endpoints in the system.
"""

from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdmin(BasePermission):
    """
    Permission class checking if the authenticated user has the 'admin' role.
    """
    def has_permission(self, request, view):
        """
        Verify if request user is authenticated and is an admin (role or superuser).
        """
        user = request.user
        return (
            user.is_authenticated
            and (getattr(user, "role", None) == "admin" or getattr(user, "is_superuser", False))
        )


class IsAdminUserRole(BasePermission):
    """
    Custom permission to allow only users with role 'admin'.
    """
    def has_permission(self, request, view):
        """
        Verify if request user is authenticated and is an admin (role or superuser).
        """
        user = request.user
        return (
            user.is_authenticated
            and (getattr(user, "role", None) == "admin" or getattr(user, "is_superuser", False))
        )


class IsAdminOrSelf(BasePermission):
    """
    Permission class allowing access to admins or the user themselves.
    """
    def has_object_permission(self, request, view, obj):
        """
        Verify if user is admin or is the target user/profile owner.
        """
        user_obj = getattr(obj, "user", obj)
        return request.user.is_admin or user_obj == request.user


class IsStudent(BasePermission):
    """
    Permission class checking if the user has the 'student' role.
    """
    def has_permission(self, request, view):
        """
        Verify if request user is authenticated and is a student.
        """
        return request.user.is_authenticated and getattr(request.user, "role", None) == "student"


class IsAcademicSupervisor(BasePermission):
    """
    Allows only academic supervisors to perform evaluation actions.
    """
    def has_permission(self, request, view):
        """
        Verify if request user is authenticated and is an academic supervisor.
        """
        return request.user.is_authenticated and getattr(request.user, "role", None) == "academic_supervisor"


class IsWorkplaceSupervisor(BasePermission):
    """
    Permission class checking if the user has the 'workplace_supervisor' role.
    """
    def has_permission(self, request, view):
        """
        Verify if request user is authenticated and is a workplace supervisor.
        """
        return request.user.is_authenticated and getattr(request.user, "role", None) == "workplace_supervisor"


class IsAdminOrAcademicSupervisor(BasePermission):
    """
    Allows admins or academic supervisors.
    """
    def has_permission(self, request, view):
        """
        Verify if request user is authenticated and is either admin or academic supervisor.
        """
        return request.user.is_authenticated and (
            (getattr(request.user, "role", None) == "admin" or getattr(request.user, "is_superuser", False)) or
            getattr(request.user, "role", None) == "academic_supervisor"
        )


class IsAdminOrAnySupervisor(BasePermission):
    """
    Allows admins or academic/workplace supervisors.
    """
    def has_permission(self, request, view):
        """
        Verify if request user is authenticated and is an admin or supervisor.
        """
        return request.user.is_authenticated and (
            (getattr(request.user, "role", None) == "admin" or getattr(request.user, "is_superuser", False)) or
            getattr(request.user, "role", None) == "academic_supervisor" or
            getattr(request.user, "role", None) == "workplace_supervisor"
        )


class IsAdminOrReadOnly(BasePermission):
    """
    Permits read-only requests for any authenticated user, and write operations only for admins.
    """
    def has_permission(self, request, view):
        """
        Allow safe HTTP methods, restrict unsafes to Admin role.
        """
        if request.method in SAFE_METHODS:
            return request.user.is_authenticated
        return request.user.is_authenticated and (
            getattr(request.user, "role", None) == "admin" or getattr(request.user, "is_superuser", False)
        )


class IsRelatedToWeeklyLog(BasePermission):
    """
    Object-level permission for WeeklyLog access.

    Ensures users only access logs related to them.
    - Students only access their own logs.
    - Workplace supervisors only access logs of students assigned to them.
    - Academic supervisors only access logs of students assigned to them.
    - Admins have full access.
    """
    def has_permission(self, request, view):
        """
        Verify the user is authenticated.
        """
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        """
        Check object association based on user role.
        """
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

        if role == 'admin' or getattr(user, 'is_superuser', False):
            return True

        return False