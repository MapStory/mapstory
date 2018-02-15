import csv
import json

from django.db import transaction
from django.http import HttpResponse

from geonode.utils import json_response
from geonode.utils import resolve_object

from mapstory.storypins.forms import StoryPinForm
from mapstory.storypins.models import StoryPin
from mapstory.storypins.utils import unicode_csv_dict_reader
from mapstory.mapstories.models import Map


def _storypins_get(req, mapid):
    mapobj = resolve_object(req, Map, {'id': mapid}, permission='base.view_resourcebase')
    cols = ['title', 'content', 'media', 'start_time', 'end_time', 'in_map', 'in_timeline', 'appearance', 'auto_show', 'pause_playback']
    ann = StoryPin.objects.filter(map=mapid)
    ann = ann.order_by('start_time', 'end_time', 'title')
    if bool(req.GET.get('in_map', False)):
        ann = ann.filter(in_map=True)
    if bool(req.GET.get('in_timeline', False)):
        ann = ann.filter(in_timeline=True)
    if 'page' in req.GET:
        page = int(req.GET['page'])
        page_size = 25
        start = page * page_size
        end = start + page_size
        ann = ann[start:end]

    if 'csv' in req.GET:
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename=map-%s-storypins.csv' % mapobj.id
        response['Content-Encoding'] = 'utf-8'
        writer = csv.writer(response)
        writer.writerow(cols)
        sidx = cols.index('start_time')
        eidx = cols.index('end_time')
        # default csv writer chokes on unicode
        encode = lambda v: v.encode('utf-8') if isinstance(v, basestring) else str(v)
        get_value = lambda a, c: getattr(a, c) if c not in ('start_time', 'end_time') else ''
        for a in ann:
            vals = [encode(get_value(a, c)) for c in cols]
            vals[sidx] = a.start_time_str
            vals[eidx] = a.end_time_str
            writer.writerow(vals)
        return response

    # strip the superfluous id, it will be added at the feature level
    props = [c for c in cols if c != 'id']

    def encode(query_set):
        results = []
        for res in query_set:
            feature = {'id': res.id}
            if res.the_geom:
                feature['geometry'] = res.the_geom

            fp = feature['properties'] = {}
            for p in props:
                val = getattr(res, p)
                if val is not None:
                    fp[p] = val
            results.append(feature)
        return results

    return json_response({'type':'FeatureCollection','features':encode(ann)})


def _storypins_post(req, mapid):
    mapobj = resolve_object(req, Map, {'id':mapid}, permission='base.change_resourcebase')

    # default action
    action = 'upsert'
    # default for json to unpack properties for each 'row'
    get_props = lambda r: r['properties']
    # operation to run on completion
    finish = lambda: None
    # track created storypins
    created = []
    # csv or client to account for differences
    form_mode = 'client'
    content_type = None
    overwrite = False
    error_format = None

    def id_collector(form):
        created.append(form.instance.id)

    if not req.FILES:
        # json body
        data = json.loads(req.body)
        if isinstance(data, dict):
            action = data.get('action', action)
        if 'features' in data:
            data = data.get('features')
    else:
        fp = iter(req.FILES.values()).next()
        # ugh, builtin csv reader chokes on unicode
        data = unicode_csv_dict_reader(fp)
        id_collector = lambda f: None
        form_mode = 'csv'
        content_type = 'text/html'
        get_props = lambda r: r
        ids = list(StoryPin.objects.filter(map=mapobj).values_list('id', flat=True))
        # delete existing, we overwrite
        finish = lambda: StoryPin.objects.filter(id__in=ids).delete()
        overwrite = True

        def error_format(row_errors):
            response = []
            for re in row_errors:
                row = re[0] + 1
                for e in re[1]:
                    response.append('[%s] %s : %s' % (row, e, re[1][e]))
            return 'The following rows had problems:<ul><li>' + '</li><li>'.join(response) + "</li></ul>"

    if action == 'delete':
        StoryPin.objects.filter(pk__in=data['ids'], map=mapobj).delete()
        return json_response({'success': True})

    if action != 'upsert':
        return HttpResponse('%s not supported' % action, status=400)

    errors = _write_storypins(data, get_props, id_collector, mapobj, overwrite, form_mode)

    if errors:
        transaction.rollback()
        body = None
        if error_format:
            return HttpResponse(error_format(errors), status=400)
    else:
        finish()
        transaction.commit()
        body = {'success': True}
        if created:
            body['ids'] = created

    return json_response(body=body, errors=errors, content_type=content_type)


def _write_storypins(data, get_props, id_collector, mapobj, overwrite, form_mode):
    i = None
    errors = []
    for i, r in enumerate(data):
        props = get_props(r)
        props['map'] = mapobj.id
        ann = None
        id = r.get('id', None)
        if id and not overwrite:
            ann = StoryPin.objects.get(map=mapobj, pk=id)

        # form expects everything in the props, copy geometry in
        if 'geometry' in r:
            props['geometry'] = r['geometry']
        props.pop('id', None)
        form = StoryPinForm(props, instance=ann, form_mode=form_mode)
        if not form.is_valid():
            errors.append((i, form.errors))
        else:
            form.save()
        if id is None:
            id_collector(form)
    if i is None:
        errors = [(0, 'No data could be read')]
    return errors


def storypins(req, mapid):
    '''management of storypins for a given mapid'''
    if req.method == 'GET':
        return _storypins_get(req, mapid)
    if req.method == 'POST':
        return _storypins_post(req, mapid)

    return HttpResponse(status=400)
