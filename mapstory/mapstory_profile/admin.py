from django.contrib import admin

from geonode.people.admin import ProfileAdmin
from geonode.people.models import Profile


class ExtendedProfileAdmin(ProfileAdmin):
    list_editable = ['is_active']


admin.site.unregister(Profile)
admin.site.register(Profile, ExtendedProfileAdmin)
