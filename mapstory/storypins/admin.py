from django.contrib import admin

from mapstory.storypins.models import StoryPin


class StoryPinAdmin(admin.ModelAdmin):
    list_display = ('id', 'map', 'title')
    list_filter = ('map', 'in_map', 'in_timeline',)
    search_fields = ('map__title', 'title', 'content',)


admin.site.register(StoryPin, StoryPinAdmin)
