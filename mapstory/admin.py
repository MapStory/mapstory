from django.contrib import admin

from mapstory.models import Sponsor
from mapstory.models import NewsItem


class SponsorAdmin(admin.ModelAdmin):
    model = Sponsor
    exclude = 'stamp',
    list_display = 'name', 'link', 'icon', 'image_tag', 'description', 'order'
    list_editable = 'name', 'link', 'icon', 'description', 'order'
    list_display_links = 'image_tag',


class NewsItemAdmin(admin.ModelAdmin):
    model = NewsItem

admin.site.register(Sponsor, SponsorAdmin)
admin.site.register(NewsItem, NewsItemAdmin)