from django.contrib import admin

from .models import Initiative, InitiativeMembership, JoinRequest


admin.site.register(Initiative)
admin.site.register(InitiativeMembership)
admin.site.register(JoinRequest)
