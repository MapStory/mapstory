from django import forms
from django.contrib import admin
from django.core import urlresolvers
from django.utils.safestring import mark_safe
from django.conf import settings
from geonode.people.models import Profile

from mapstory.apps.flag.models import FlaggedContent, FlagInstance

from datetime import datetime

_absolute_url_resolvers = {}
_group_to_flag_type = {}


def register_absolute_url_resolver(model_class, func):
    _absolute_url_resolvers[model_class] = func


def register_group_to_flag_types(*mappings):
    _group_to_flag_type.update(mappings)


def flagged_object_link(model):
    content = getattr(model, 'flagged_content', model)
    obj = content.content_object
    url = obj.get_absolute_url() if hasattr(obj, 'get_absolute_url') else None
    if not url:
        resolver = _absolute_url_resolvers.get(type(obj), None)
        if resolver:
            url = resolver(obj)
    if not url: return ''
    return "<a href='%s'>%s</a>" % (url, obj._meta.verbose_name)
flagged_object_link.short_description = 'The Flagged Item'
flagged_object_link.allow_tags = True


def user_link(flag_instance):
    user = flag_instance.user
    return "<a href='%s'>%s</a>" % (user.get_absolute_url(), user.username)
user_link.short_description = 'User'
user_link.allow_tags = True


def flagged_content_link(flag_instance):
    url = urlresolvers.reverse("admin:flag_flaggedcontent_change",
                    args=(flag_instance.flagged_content.id,))
    return "<a href='%s'>%s</a>" % (url, 'Admin Link')
flagged_content_link.short_description = 'Flagged Content'
flagged_content_link.allow_tags = True


def flag_link(flag_instance):
    url = urlresolvers.reverse("admin:flag_flaginstance_change",
                    args=(flag_instance.id,))
    return "<a href='%s'>%s</a>" % (url, 'Admin Link')
flag_link.short_description = 'Link to Flag'
flag_link.allow_tags = True


class InlineFlagInstance(admin.TabularInline):
    readonly_fields = ('user', 'flag_type', 'comment', 'when_added', 'when_recalled', flag_link)
    model = FlagInstance
    extra = 0


class FlaggedContentForm(forms.ModelForm):
    flagged_object = forms.CharField(label='Link to Flagged Item')
    moderator = forms.ModelChoiceField(queryset=
        Profile.objects.filter(groups__name__in=_group_to_flag_type.keys()))
    class Meta:
        model = FlaggedContent
        fields = '__all__'

    def __init__(self, *args, **kw):
        super(FlaggedContentForm, self).__init__(*args, **kw)
        link = mark_safe(unicode(flagged_object_link(self.instance)))
        self.fields['flagged_object'].widget.render = lambda *a,**kw: link


class FlaggedContentAdmin(admin.ModelAdmin):
    form = FlaggedContentForm
    list_display = ('pk', 'content_type', 'status', 'count', 'moderator')
    fields = ('moderator', 'status', 'flagged_object')
    exclude = ('content_type', 'object_id')
    readonly_fields = ('creator', 'count')
    inlines = [InlineFlagInstance]


class ActiveFilter(admin.SimpleListFilter):
    title = 'Active'
    parameter_name = 'active'

    def lookups(self, request, model_admin):
        return (
            ('active', 'Active'),
            ('resolved', 'Resolved'),
        )

    def queryset(self, request, queryset):
        val =  self.value()
        if val == 'active':
            queryset = queryset.filter(when_recalled__isnull=True)
        elif val == 'resolved':
            queryset = queryset.filter(when_recalled__isnull=False)
        return queryset


class FlagInstanceAdmin(admin.ModelAdmin):
    ordering = ('-when_recalled', '-when_added')
    exclude = ('flagged_content', )
    list_display = ('pk', flagged_content_link, user_link, 'when_recalled',
                    'when_added', 'comment', 'flag_type', flagged_object_link)
    list_filter = ('flag_type', ActiveFilter)
    readonly_fields = ('user', 'when_added', 'when_recalled', 'flag_type')
    actions = ['recall_flag']

    def recall_flag(self, req, qs):
        # filter any already recalled flags
        qs = qs.filter(when_recalled__isnull = True)
        qs.update(when_recalled=datetime.now())

    def queryset(self, request):
        qs = super(FlagInstanceAdmin, self).queryset(request)
        groups = request.user.groups.values_list('name', flat=True)
        for group, flag_type in _group_to_flag_type.items():
            if group in groups:
                qs = qs.filter(flag_type=flag_type)
        return qs


admin.site.register(FlaggedContent, FlaggedContentAdmin)
admin.site.register(FlagInstance, FlagInstanceAdmin)