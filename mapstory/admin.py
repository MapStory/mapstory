from django.contrib import admin
from django import forms

from mapstory.models import Sponsor
from mapstory.models import NewsItem
from mapstory.models import DiaryEntry
from mapstory.models import GetPage
from mapstory.models import GetPageContent


class GetPageAdmin(admin.ModelAdmin):
    model = GetPage
    list_display = 'name', 'title', 'subtitle'
    list_editable = 'title', 'subtitle'
    list_display_links = 'name',


class GetPageChoiceField(forms.ModelChoiceField):
    def __init__(self):
        super(GetPageChoiceField, self).__init__(GetPage.objects.all())
    def label_from_instance(self, obj):
        return obj.title


class GetPageContentForm(forms.ModelForm):
    page = GetPageChoiceField()
    class Meta:
        model = GetPageContent


class GetPageContentAdmin(admin.ModelAdmin):
    model = GetPageContent
    form = GetPageContentForm
    list_display = 'title', 'subtitle', 'page', 'order', 'date', 'publish'
    list_editable = 'subtitle', 'order', 'publish'
    list_display_links = 'title',


class SponsorAdmin(admin.ModelAdmin):
    model = Sponsor
    exclude = 'stamp',
    list_display = 'name', 'link', 'icon', 'image_tag', 'description', 'order'
    list_editable = 'name', 'link', 'icon', 'description', 'order'
    list_display_links = 'image_tag',


class NewsItemAdmin(admin.ModelAdmin):
    model = NewsItem


class DiaryEntryAdmin(admin.ModelAdmin):
    model = DiaryEntry
    list_display = 'title', 'author', 'publish', 'date'
    list_editable = 'publish',


admin.site.register(GetPage, GetPageAdmin)
admin.site.register(GetPageContent, GetPageContentAdmin)
admin.site.register(Sponsor, SponsorAdmin)
admin.site.register(NewsItem, NewsItemAdmin)
admin.site.register(DiaryEntry, DiaryEntryAdmin)
