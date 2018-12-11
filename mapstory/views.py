import datetime
import json

from django.views.generic import TemplateView
from django.views.generic.detail import DetailView
from django.views.generic.list import ListView

from geonode.base.models import Region
from mapstory.journal.models import JournalEntry
from mapstory.models import Baselayer, DefaultBaselayer, GetPage, Leader, NewsItem, get_images, get_sponsors
from django.http import HttpResponse


class IndexView(TemplateView):
    template_name = 'index.html'

    def get_context_data(self, **kwargs):
        ctx = super(IndexView, self).get_context_data(**kwargs)
        ctx['sponsors'] = get_sponsors()
        news_items = NewsItem.objects.filter(date__lte=datetime.datetime.now())
        ctx['news_items'] = news_items[:3]
        ctx['images'] = get_images()
        # for now, limit to max of 8.
        ctx['journal_entries'] = JournalEntry.objects.filter(
            publish=True, show_on_main=True)[:8]

        return ctx


class GetPageView(DetailView):
    template_name = 'mapstory/getpage.html'
    model = GetPage
    slug_field = 'name'


class SearchView(TemplateView):
    template_name = 'search/explore.html'

    def get_context_data(self, **kwargs):
        context = super(TemplateView, self).get_context_data(**kwargs)
        context['regions'] = Region.objects.filter(level=1)
        return context


class LeaderListView(ListView):
    context_object_name = 'leaders'
    model = Leader


def baselayer_view(request):
    return HttpResponse(json.dumps({"defaultLayer": DefaultBaselayer.objects.first().layer.name,
                                    "layers":  map(lambda x: x.to_object(), Baselayer.objects.all())}))
