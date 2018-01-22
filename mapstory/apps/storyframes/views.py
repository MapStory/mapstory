from django.db import transaction
from django.http import HttpResponse
from .models import StoryFrame
from .forms import StoryFrameForm
from .utils import unicode_csv_dict_reader
from geonode.utils import resolve_object
from mapstory.mapstories.models import Map
from geonode.utils import json_response

import csv
import json


def _storyframes_get(req, mapid):
    mapobj = resolve_object(req, Map, {'id': mapid}, permission='base.view_resourcebase')
    cols = ['title', 'description', 'start_time', 'end_time', 'center', 'speed',
            'interval', 'playback', 'playbackRate', 'intervalRate', 'zoom']
    storyframe = StoryFrame.objects.filter(map=mapid)
    storyframe = storyframe.order_by('start_time', 'end_time', 'title')
    if bool(req.GET.get('in_map', False)):
        storyframe = storyframe.filter(in_map=True)
    if bool(req.GET.get('in_timeline', False)):
        storyframe = storyframe.filter(in_timeline=True)
    if 'page' in req.GET:
        page = int(req.GET['page'])
        page_size = 25
        start = page * page_size
        end = start + page_size
        storyframe = storyframe[start:end]

    if 'csv' in req.GET:
        response = HttpResponse(mimetype='text/csv')
        response['Content-Disposition'] = 'attachment; filename=map-%s-storyframes.csv' % mapobj.id
        response['Content-Encoding'] = 'utf-8'
        writer = csv.writer(response)
        writer.writerow(cols)
        sidx = cols.index('start_time')
        eidx = cols.index('end_time')
        # default csv writer chokes on unicode
        encode = lambda v: v.encode('utf-8') if isinstance(v, basestring) else str(v)
        get_value = lambda a, c: getattr(a, c) if c not in ('start_time', 'end_time') else ''
        for a in    storyframe:
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
            feature = { 'id' : res.id}
            if res.the_geom:
                feature['geometry'] = res.the_geom

            fp = feature['properties'] = {}
            for p in props:
                val = getattr(res, p)
                if val is not None:
                    if isinstance(val, unicode) and '{' in val:
                        import ast
                        fp[p] = ast.literal_eval(val)
                    elif isinstance(val, unicode) and '[' in val:
                        import ast
                        fp[p] = ast.literal_eval(val)

                    else:
                        fp[p] = val
            results.append(feature)
        return results

    return json_response({'type':'FeatureCollection','features':encode(storyframe)})


def _storyframes_post(req, mapid):
    mapobj = resolve_object(req, Map, {'id':mapid}, permission='base.change_resourcebase')

    # default action
    action = 'upsert'
    # default for json to unpack properties for each 'row'
    get_props = lambda r: r['properties']
    # operation to run on completion
    finish = lambda: None
    # track created storyframes
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
        ids = list(StoryFrame.objects.filter(map=mapobj).values_list('id', flat=True))
        # delete existing, we overwrite
        finish = lambda: StoryFrame.objects.filter(id__in=ids).delete()
        overwrite = True

        def error_format(row_errors):
            response = []
            for re in row_errors:
                row = re[0] + 1
                for e in re[1]:
                    response.append('[%s] %s : %s' % (row, e, re[1][e]))
            return 'The following rows had problems:<ul><li>' + '</li><li>'.join(response) + "</li></ul>"

    if action == 'delete':
        StoryFrame.objects.filter(pk__in=data['ids'], map=mapobj).delete()
        return json_response({'success': True})

    if action != 'upsert':
        return HttpResponse('%s not supported' % action, status=400)

    try:
        with transaction.atomic():
            errors = _try_write_storyframes(data, get_props, id_collector, mapobj, overwrite, form_mode)
    except RuntimeError as e:
        body = None
        if error_format:
            return HttpResponse(error_format(['Runtime Error']), status=400)

    finish()
    body = {'success': True}
    if created:
        body['ids'] = created

    return json_response(body=body, errors=errors, content_type=content_type)


def _try_write_storyframes(data, get_props, id_collector, mapobj, overwrite, form_mode):
    errors = _write_storyframes(data, get_props, id_collector, mapobj, overwrite, form_mode)

    if len(errors) > 0:
        raise RuntimeError

    return errors


def _write_storyframes(data, get_props, id_collector, mapobj, overwrite, form_mode):
    i = None
    errors = []
    for i, r in enumerate(data):
        props = get_props(r)
        props['map'] = mapobj.id
        storyframe = None
        id = r.get('id', None)
        if id and not overwrite:
            storyframe = StoryFrame.objects.get(map=mapobj, pk=id)

        # form expects everything in the props, copy geometry in
        if 'geometry' in r:
            props['geometry'] = r['geometry']
        props.pop('id', None)
        form = StoryFrameForm(props, instance=storyframe, form_mode=form_mode)
        if not form.is_valid():
            errors.append((i, form.errors))
        else:
            form.save()
        if id is None:
            id_collector(form)
    if i is None:
        errors = [(0, 'No data could be read')]
    return errors


def storyframes(req, mapid):
    '''management of storyframes for a given mapid'''
    if req.method == 'GET':
        return _storyframes_get(req, mapid)
    if req.method == 'POST':
        return _storyframes_post(req, mapid)

    return HttpResponse(status=400)




