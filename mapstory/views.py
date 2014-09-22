from django.core.exceptions import PermissionDenied
from django.core.urlresolvers import reverse
from django.shortcuts import render_to_response
from django.template import RequestContext
from django.views.generic import TemplateView
from django.views.generic.edit import ModelFormMixin
from django.views.generic.edit import CreateView
from django.views.generic.edit import UpdateView
from django.views.generic.list import ListView

from mapstory.models import get_sponsors
from mapstory.models import NewsItem
from mapstory.models import DiaryEntry


class IndexView(TemplateView):
    template_name = 'index.html'

    def get_context_data(self, **kwargs):
        ctx = super(IndexView, self).get_context_data(**kwargs)
        ctx['sponsors'] = get_sponsors()
        ctx['news_items'] = NewsItem.objects.all()[:3]
        return ctx


class DiaryListView(ListView):
    template_name = 'mapstory/diary.html'
    context_object_name = 'entries'

    def get_queryset(self):
        return DiaryEntry.objects.filter(publish=True)[:10]

    def get_context_data(self, **kwargs):
        ctx = super(DiaryListView, self).get_context_data(**kwargs)
        user = self.request.user
        if user.is_authenticated():
            ctx['drafts'] = DiaryEntry.objects.filter(author=user, publish=False)
        return ctx


class DiaryMixin:
    template_name = 'mapstory/diary_edit.html'
    model = DiaryEntry
    fields = ['title', 'content', 'publish']

    def get_success_url(self):
        return reverse('diary')


class DiaryCreateView(DiaryMixin, CreateView):

    def form_valid(self, form):
        self.object = form.save(commit=False)
        self.object.author = self.request.user
        self.object.save()
        return super(ModelFormMixin, self).form_valid(form)


class DiaryUpdateView(DiaryMixin, UpdateView):

    def get_object(self, *args, **kwargs):
        obj = super(DiaryUpdateView, self).get_object(*args, **kwargs)
        user = self.request.user
        can_edit = user.is_superuser or obj.author == self.request.user
        if not can_edit:
            raise PermissionDenied()
        return obj


def test_view(req, template):
    return render_to_response('testing/%s.html' % template, RequestContext(req))
