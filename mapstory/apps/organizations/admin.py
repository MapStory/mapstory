from django.contrib import admin

from .models import Organization, OrganizationMembership, OrganizationURL



class MembershipInlineAdmin(admin.StackedInline):
    """Shows Memberships Inline
    """
    model = OrganizationMembership



class OrganizationURLInline(admin.StackedInline):
    """Shows URLs Inline
    """
    model = OrganizationURL



class OrganizationAdmin(admin.ModelAdmin):
    """Admin the Organizations

    Shows memberships and URls inline.
    """
    inlines = [MembershipInlineAdmin, OrganizationURLInline]



admin.site.register(Organization, OrganizationAdmin)
admin.site.register(OrganizationMembership)