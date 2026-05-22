from django.contrib import admin
from django.contrib.admin.sites import AdminSite
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import Group

from users.models import Child, Class, School, User

AdminSite.empty_value_display = "-"

admin.site.unregister(Group)


@admin.register(School)
class SchoolAdmin(admin.ModelAdmin):
    list_display = ("id", "name")
    search_fields = ("name",)
    show_facets = admin.ShowFacets.ALWAYS


@admin.register(Class)
class ClassAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "school")
    search_fields = ("name", "school__name")
    show_facets = admin.ShowFacets.ALWAYS
    list_filter = ("school__name",)


@admin.register(Child)
class ChildAdmin(admin.ModelAdmin):
    list_display = ("id", "first_name", "last_name", "parent", "school_name", "class_name")
    search_fields = ("first_name", "last_name", "school__name", "class_number__name")
    show_facets = admin.ShowFacets.ALWAYS
    list_filter = ("school__name",)
    date_hierarchy = "created_at"

    @admin.display(description="Родитель")
    def parent(self, obj):
        if obj.parent:
            return f"{obj.parent.first_name} {obj.parent.last_name}"
        return "Нет родителя"

    @admin.display(description="Школа")
    def school_name(self, obj):
        if obj.school:
            return obj.school.name
        return None

    @admin.display(description="Класс")
    def class_name(self, obj):
        if obj.class_number:
            return obj.class_number.name
        return None


class ChildInline(admin.TabularInline):
    model = Child
    fk_name = "parent"
    max_num = 1
    extra = 0
    verbose_name = "Ребенок"
    verbose_name_plural = "Дети"


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = (
        "id",
        "first_name",
        "last_name",
        "is_staff",
        "is_teacher",
        "email",
        "is_active",
        "created_at",
        "updated_at",
    )
    search_fields = ("email", "first_name", "last_name")
    list_filter = ("is_staff", "is_active", "is_teacher")
    readonly_fields = ("created_at", "updated_at")
    show_facets = admin.ShowFacets.ALWAYS
    ordering = ("-created_at",)
    date_hierarchy = "created_at"

    inlines = [ChildInline]
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Персональная информация", {"fields": ("first_name", "last_name", "patronymic_name", "date_of_birth")}),
        (
            "Права доступа",
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "is_teacher",
                )
            },
        ),
        (("Важные даты"), {"fields": ("last_login", "date_joined")}),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("email", "usable_password", "password1", "password2"),
            },
        ),
    )
