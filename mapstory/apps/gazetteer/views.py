from django.shortcuts import render
from django.db import transaction
from django.db.models import F
from django.http import HttpResponse, Http404
from geonode.utils import json_response
import json
from mapstory.apps.gazetteer.models import Location, LocationName
import pdb


def getloc(req, locid):
    """
        Get a location and its associtaed nested properties based on an id.
    """
    try:
        l = Location.objects.get(pk=locid)
    except Location.DoesNotExist:
        raise Http404
#    pdb.set_trace()  
    return json_response(_encodeLoc(locid,l))

def _encodeLoc(locid,l):    
    names = LocationName.objects.filter(location=locid)
    return {'type':l.locationType.code,'locid':locid, 'latitude':l.latitude, 'longitude':l.longitude, 'defaultName':l.defaultName, 'names':_encodeNames(names)}
   
def _encodeNames(names):
    namelist = [] 
    for n in names:
        namelist.append( _encodeName(n) )
    return namelist

def _encodeName(n):
    nprops = {'name':n.name, 'language':n.language }
    if n.namespace :
        nprops['namespace'] = n.namespace
    if n.nameValidStart :
        nprops['nameValidStart'] = n.nameValidStart
    if n.nameValidEnd :
        nprops['nameValidEnd'] = n.nameValidEnd
    return nprops

def matchloc(req, *args, **kwargs):
    """
    Find a matching location based on a gazetteer entry with multiple possible names and codes
    """
#   pdb.set_trace()
    try:
        if req.method == 'POST':
            locobj = json.loads(req.body)
            names = locobj['names']
        elif req.method == 'GET':
            if not req.GET.get('namespace') and req.GET.get('name').startswith('http') :
                names = [{ 'name':req.GET.get('name'), 'namespace': req.GET.get('name')[0:req.GET.get('name').rfind('/')+1] }]
            elif req.GET.get('namespace') and req.GET.get('name') :
                names = [{ 'namespace':req.GET.get('namespace'), 'name': req.GET.get('name') }]
            elif req.GET.get('namespace') :
                return HttpResponse('namespace but no corresponding name specified', status=400)
            elif req.GET['language'] and req.GET.get('name') :
                names = [{ 'language':req.GET['language'], 'name': req.GET.get('name') }]
            else :
                HttpResponse('must specify name and language or namespace', status=400)
        for nameobj in names: 
            if nameobj['namespace']:
                namelist = LocationName.objects.filter( name=nameobj['name'], namespace=nameobj['namespace'] )
                # should be just one here
                if namelist :
                    loc = Location.objects.get(id=namelist[0].location.id)
                    return json_response(_encodeLoc(loc.id,loc))
    except Exception as e:
        return HttpResponse(e, status=400)
    
# return empty list    
    return HttpResponse('{[]}', status=200)
    
def recordname(req, locid):
# dumbly assume POST for now
    status = 'hit me'
    pdb.set_trace()
    try:
        loc = Location.objects.get(id=locid)
        status = 'got loc'
        nameobj = json.loads(req.body)
        status = 'got json'
        (obj, created) = LocationName.objects.get_or_create(
        location = loc, name=nameobj['name'], language=nameobj['language'],defaults = nameobj )
        status = 'location created ' + str(created)
        if not created:
            # obj.extra_field = 'some_val'
            status =  'updating counts for ' + F( obj.name) 
    except Exception as e:
            return HttpResponse(e, status=400)
            
    return HttpResponse(status, status=200)