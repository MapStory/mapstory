from django.contrib import admin

from .models import Organization, OrganizationMembership, OrganizationURL, OrganizationMapStory, OrganizationLayer, \
    OrganizationSocialMedia, JoinRequest


class MembershipInlineAdmin(admin.StackedInline):
    """Shows Memberships Inline
    """
    model = OrganizationMembership


class OrganizationURLInline(admin.StackedInline):
    """Shows URLs Inline
    """
    model = OrganizationURL


class OrganizationLayersInline(admin.StackedInline):
    """Shows Layers Inline"""
    model = OrganizationLayer


class OrganizationMapstoryInline(admin.StackedInline):
    """Shows Mapstories Inline"""
    model = OrganizationMapStory


class OrganizationSocialMediaInline(admin.StackedInline):
    """Shows Social media inline"""
    model = OrganizationSocialMedia


class OrganizationAdmin(admin.ModelAdmin):
    """Admin the Organizations.

    The main Organization's Admin interface.
    Shows memberships and URls inline.
    """
    inlines = [
        MembershipInlineAdmin,
    ]

    exclude = ['slug']


admin.site.register(Organization, OrganizationAdmin)
admin.site.register(OrganizationMembership)
