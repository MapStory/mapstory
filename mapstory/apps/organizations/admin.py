from django.contrib import admin

from .models import Organization, OrganizationMembership, OrganizationURL, OrganizationMapStory, OrganizationLayer, OrganizationSocialMedia



class MembershipInlineAdmin(admin.StackedInline):
    """Shows Memberships Inline
    """
    model = OrganizationMembership



class OrganizationURLInline(admin.StackedInline):
    """Shows URLs Inline
    """
    model = OrganizationURL



class OrganizationLayersInline(admin.StackedInline):
    model = OrganizationLayer



class OrganizationMapstoryInline(admin.StackedInline):
    model = OrganizationMapStory


class OrganizationSocialMediaInline(admin.StackedInline):
    model = OrganizationSocialMedia



class OrganizationAdmin(admin.ModelAdmin):
    """Admin the Organizations

    Shows memberships and URls inline.
    """
    inlines = [
        MembershipInlineAdmin,
        OrganizationURLInline,
        OrganizationLayersInline,
        OrganizationMapstoryInline,
        OrganizationSocialMediaInline,
    ]



admin.site.register(Organization, OrganizationAdmin)
admin.site.register(OrganizationMembership)