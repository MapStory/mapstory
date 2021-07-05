import datetime
import json
from geonode.maps.views import new_map_config

from django.views.generic import TemplateView
from django.views.generic.detail import DetailView
from django.views.generic.list import ListView

from geonode.base.models import Region
from mapstory.journal.models import JournalEntry
from mapstory.models import Baselayer, BaselayerDefault, GetPage, Leader, NewsItem, get_images, get_sponsors
from django.http import HttpResponse
from django.shortcuts import render
from django.conf import settings

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
    return HttpResponse(json.dumps({"defaultLayer": BaselayerDefault.objects.first().layer.name,
                                    "layers":  [x.to_object() for x in Baselayer.objects.all()]}))


def maploom_new_map(request, template='maps/map_new.html'):
    map_obj, config = new_map_config(request)

    config_obj = json.loads(config)

    sources_array = []
    layers = []

    for layer in Baselayer.objects.all():
        layer_obj = layer.to_object()
        try:
            source_index = sources_array.index(layer_obj["source"])
        except ValueError:
            sources_array.append(layer_obj["source"])
            source_index = len(sources_array) - 1

        layer_obj["source"] = str(source_index)
        layers.append(layer_obj)

    sources_array.append({
        "title": "GeoServer - Public Layers",
        "attribution": "&copy; %s",
        "ptype": "gxp_wmscsource",
        "url": settings.SITEURL + "/geoserver/wms",
        "restUrl": "/gs/rest"
    })
    viewed_layer = config_obj["map"]["layers"][-1]
    viewed_layer["source"] = str(len(sources_array) - 1)

    layers.append(viewed_layer)

    sources = {}
    for idx, source in enumerate(sources_array):
        sources[str(idx)] = source

    # print(sources)

    config_obj["map"]["layers"] = layers
    config_obj["sources"] = sources

    context_dict = {
        "config": json.dumps(config_obj),
        "map": map_obj
    }

    context_dict["preview"] = getattr(
        settings,
        'GEONODE_CLIENT_LAYER_PREVIEW_LIBRARY',
        'geoext')
    if isinstance(config, HttpResponse):
        return config
    else:
        return render(
            request,
            template,
            context=context_dict)


