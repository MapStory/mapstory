from django.core.exceptions import PermissionDenied
from django.core.urlresolvers import reverse
from django.shortcuts import render_to_response
from django.template import RequestContext
from django.views.generic import TemplateView
from django.views.generic.edit import ModelFormMixin
from django.views.generic.edit import CreateView
from django.views.generic.detail import DetailView
from django.views.generic.edit import UpdateView
from django.views.generic.list import ListView

from geonode.people.models import Profile

from mapstory.models import get_sponsors
from mapstory.models import GetPage
from mapstory.models import NewsItem
from mapstory.models import DiaryEntry

from geonode.base.models import Region

import datetime

class IndexView(TemplateView):
    template_name = 'index.html'

    def get_context_data(self, **kwargs):
        ctx = super(IndexView, self).get_context_data(**kwargs)
        ctx['sponsors'] = get_sponsors()
        news_items = NewsItem.objects.filter(date__lte=datetime.datetime.now())
        ctx['news_items'] = news_items[:3]
        return ctx


class DiaryListView(ListView):
    template_name = 'mapstory/diary.html'
    context_object_name = 'entries'
    paginate_by = 10

    def get_queryset(self):
        return DiaryEntry.objects.filter(publish=True)

    def get_context_data(self, **kwargs):
        ctx = super(DiaryListView, self).get_context_data(**kwargs)
        user = self.request.user
        if user.is_authenticated():
            ctx['drafts'] = DiaryEntry.objects.filter(author=user, publish=False)
        return ctx


class DiaryPermissionMixin(object):
    need_publish = False

    def get_object(self, *args, **kwargs):
        obj = super(DiaryPermissionMixin, self).get_object(*args, **kwargs)
        user = self.request.user
        if self.need_publish:
            can_view = obj.publish
        else:
            can_view = user.is_superuser or obj.author == self.request.user
        if not can_view:
            raise PermissionDenied()
        return obj


class DiaryDetailView(DiaryPermissionMixin, DetailView):
    template_name = 'mapstory/diary_detail.html'
    model = DiaryEntry
    need_publish = True
    context_object_name = 'entry'


class DiaryEditMixin(object):
    template_name = 'mapstory/diary_edit.html'
    model = DiaryEntry
    fields = ['title', 'content', 'publish']

    def get_success_url(self):
        return reverse('diary')


class DiaryCreateView(DiaryEditMixin, CreateView):

    def form_valid(self, form):
        self.object = form.save(commit=False)
        self.object.author = self.request.user
        self.object.save()
        return super(ModelFormMixin, self).form_valid(form)


class DiaryUpdateView(DiaryEditMixin, DiaryPermissionMixin, UpdateView):
    pass


class GetPageView(DetailView):
    template_name = 'mapstory/getpage.html'
    model = GetPage
    slug_field = 'name'


class SearchView(TemplateView):
    template_name='search/searchn.html'
    def get_context_data(self, **kwargs):
        context = super(TemplateView, self).get_context_data(**kwargs)
        context['regions'] = Region.objects.filter(level=1)
        return context


class ProfileDetail(DetailView):
    template_name = 'people/profile_detail.html'
    slug_field = 'username'
    model = Profile

    def get_context_data(self, **kwargs):
        ctx = super(ProfileDetail, self).get_context_data(**kwargs)
        return ctx


def test_view(req, template):
    return render_to_response('testing/%s.html' % template, RequestContext(req))
