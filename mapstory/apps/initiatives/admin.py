from django.contrib import admin

from .models import Initiative, InitiativeMembership, JoinRequest


class InitiativeAdmin(admin.ModelAdmin):
    exclude = ("slug",)


admin.site.register(Initiative, InitiativeAdmin)
admin.site.register(InitiativeMembership)
admin.site.register(JoinRequest)
