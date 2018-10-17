from django.contrib import admin

from .models import Initiative, InitiativeMembership, JoinRequest, InitiativeLayer, InitiativeMapStory


class MembershipInlineAdmin(admin.StackedInline):
    """Shows Memberships Inline"""
    model = InitiativeMembership


class InitiativeLayersInline(admin.StackedInline):
    """Shows Layers Inline"""
    model = InitiativeLayer


class InitiativeAdmin(admin.ModelAdmin):
    inlines = [
        MembershipInlineAdmin,
    ]
    exclude = ("slug",)


class InitiativeMapstoryInline(admin.StackedInline):
    """Shows Mapstories Inline"""
    model = InitiativeMapStory


admin.site.register(Initiative, InitiativeAdmin)
admin.site.register(InitiativeMembership)
