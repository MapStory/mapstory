from django.contrib import admin

from django import forms

from mapstory.models import Sponsor
from mapstory.models import Community
from mapstory.models import NewsItem
from mapstory.models import DiaryEntry
from mapstory.models import GetPage
from mapstory.models import GetPageContent
from mapstory.models import Leader
from mapstory.models import ParallaxImage
from mapstory.models import Task
from mapstory.models import CustomSite

from mapstory.export import export_via_model

from mapstory.apps.flag import admin as flag_admin

from geonode.people.admin import ProfileAdmin as UserAdmin


def content_html(obj):
    return obj.html()
content_html.allow_tags = True
content_html.short_description = 'Content'


def export_as_csv_action(description="Export selected objects as CSV file",
                         fields=None, exclude=None, query_factory=None):
    """
    This function returns an export csv action
    'fields' and 'exclude' work like in django ModelForm
    'header' is whether or not to output the column names as the first row
    """
    def export_as_csv(modeladmin, request, queryset):
        """
        Generic csv export admin action.
        based on http://djangosnippets.org/snippets/1697/
        queryset is an iterable returning an object
        with attributes or no-arg callables matching the field names
        """
        if query_factory:
            queryset = query_factory(queryset)

        return export_via_model(
            modeladmin.model,
            request,
            queryset,
            fields,
            exclude
        )

    export_as_csv.short_description = description
    return export_as_csv


# remove non important values form the export script
export_func = export_as_csv_action(
    exclude=[
        'password',
        'is_active',
        'is_superuser',
        'id'
    ]
)
UserAdmin.actions = [export_func]


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

class TaskInline(admin.StackedInline):
    model = Task

class CommunityAdmin(admin.ModelAdmin):
    inlines = [TaskInline, ]
    model = Community
    exclude = 'stamp', 'slug'
    list_display = 'name', 'icon', 'image_tag', 'description', 'order'
    list_editable = 'icon', 'description', 'order'
    list_display_links = 'name', 'image_tag',


class NewsItemForm(forms.ModelForm):
    date = forms.DateTimeField(
        help_text='News will appear after this time',
        label='Publication Time',
        widget=admin.widgets.AdminSplitDateTime
    )


class NewsItemAdmin(admin.ModelAdmin):
    model = NewsItem
    list_display = 'title', 'publication_time', content_html
    exclude = 'publish',
    form = NewsItemForm


class DiaryEntryAdmin(admin.ModelAdmin):
    model = DiaryEntry
    list_display = 'title', 'author', 'publish', 'date'
    list_editable = 'publish',


class LeaderAdmin(admin.ModelAdmin):
    model = Leader
    list_display = 'user',

class ParallaxImageAdmin(admin.ModelAdmin):
    model = ParallaxImage
    list_display = 'name',

flag_admin.register_group_to_flag_types(
    ('dev_moderator', 'broken'),
    ('content_moderator', 'inappropriate')
)


class CustomSiteAdmin(admin.ModelAdmin):
    model = CustomSite

admin.site.register(GetPage, GetPageAdmin)
admin.site.register(GetPageContent, GetPageContentAdmin)
admin.site.register(Sponsor, SponsorAdmin)
admin.site.register(Community, CommunityAdmin)
admin.site.register(NewsItem, NewsItemAdmin)
admin.site.register(DiaryEntry, DiaryEntryAdmin)
admin.site.register(Leader, LeaderAdmin)
admin.site.register(ParallaxImage, ParallaxImageAdmin)
admin.site.register(CustomSite, CustomSiteAdmin)