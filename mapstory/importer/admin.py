from .models import UploadedData, UploadLayer, UploadFile
from django.contrib import admin


class UploadAdmin(admin.ModelAdmin):
    pass


admin.site.register(UploadLayer, UploadAdmin)
admin.site.register(UploadedData, UploadAdmin)
admin.site.register(UploadFile, UploadAdmin)
