from django.contrib import admin

from models import ThumbnailImage


class ThumbnailAdmin(admin.ModelAdmin):
    # Registers thumbnails for administration.
    model = ThumbnailImage

admin.site.register(ThumbnailImage, ThumbnailAdmin)
