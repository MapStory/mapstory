from mapstory.apps.storyframes.models import StoryFrame
from django.contrib import admin

class StoryFrameAdmin(admin.ModelAdmin):
    list_display = ('id', 'map', 'title')
    list_filter = ('map',)
    search_fields = ('map__title', 'title', 'description',)


admin.site.register(StoryFrame, StoryFrameAdmin)