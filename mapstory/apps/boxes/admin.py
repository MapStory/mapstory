from mapstory.apps.boxes.models import StoryBox
from django.contrib import admin

class StoryBoxAdmin(admin.ModelAdmin):
    list_display = ('id', 'map', 'title')
    list_filter = ('map',)
    search_fields = ('map__title', 'title', 'description',)


admin.site.register(StoryBox, StoryBoxAdmin)