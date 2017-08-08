from django.contrib import admin

from models import Organization, OrganizationMembership



class MembershipInlineAdmin(admin.StackedInline):
    model = OrganizationMembership



class OrganizationAdmin(admin.ModelAdmin):
    """Organizations' Admin"""
    inlines = [MembershipInlineAdmin,]



admin.site.register(Organization, OrganizationAdmin)
admin.site.register(OrganizationMembership)