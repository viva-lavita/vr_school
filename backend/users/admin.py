from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import Group

from users.models import Child, User

admin.site.unregister(Group)


@admin.register(Child)
class ChildAdmin(admin.ModelAdmin):
    list_display = ("id", "first_name", "last_name", "parent")
    search_fields = ("first_name", "last_name")
    show_facets = admin.ShowFacets.ALWAYS


class ChildInline(admin.TabularInline):
    model = Child
    fk_name = "parent"
    max_num = 1
    extra = 0
    verbose_name = "Дети"
    verbose_name_plural = "Дети"


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ("id", "email", "is_staff", "is_active", "created_at", "updated_at")
    search_fields = ("email", "first_name", "last_name")
    list_filter = ("is_staff", "is_active")
    readonly_fields = ("created_at", "updated_at")
    show_facets = admin.ShowFacets.ALWAYS
    ordering = ("email",)
    filter_horizontal = ("user_permissions",)

    inlines = [ChildInline]
    fieldsets = (
        (None, {"fields": ("email", "password", "post")}),
        ("Персональная информация", {"fields": ("first_name", "last_name")}),
        (
            "Права доступа",
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
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
