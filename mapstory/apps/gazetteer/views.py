from django.shortcuts import render
from django.db import transaction
from django.db.models import F
from django.http import HttpResponse, Http404
from geonode.utils import json_response
import json
from mapstory.apps.gazetteer.models import Location, LocationName
import pdb

# Get a location - with its associated names
def getloc(req, locid):
    try:
        l = Location.objects.get(pk=locid)
    except Location.DoesNotExist:
        raise Http404
    
    names = LocationName.objects.filter(location=locid)
    return json_response({'type':'gaz:Location','locid':locid, 'defaultName':l.defaultName, 'names':_encodeNames(names)})
   
def _encodeNames(names):
    namelist = [] 
    for n in names:
        namelist.append( _encodeName(n) )
    return namelist

def _encodeName(n):
    nprops = {'name':n.name, 'language':n.language }
    if n.namespace :
        nprops['n.namespace'] = n.namespace
    if n.nameValidStart :
        nprops['nameValidStart'] = n.nameValidStart
    if n.nameValidEnd :
        nprops['nameValidEnd'] = n.nameValidEnd
    return nprops
    
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