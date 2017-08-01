from django.contrib import admin

from models import Organization


class OrganizationAdmin(admin.ModelAdmin):
    """Organizations' Admin"""
    model = Organization


admin.site.register(Organization, OrganizationAdmin)
