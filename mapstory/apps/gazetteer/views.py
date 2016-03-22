from django.shortcuts import render
from django.db import transaction
from django.http import HttpResponse, Http404
from geonode.utils import json_response
import json
from mapstory.apps.gazetteer.models import Location, LocationName

# Get a location - with its associated names
def getloc(req, locid):
    try:
        l = Location.objects.get(pk=locid)
    except Location.DoesNotExist:
        raise Http404
    
    names = LocationName.objects.filter(Location=locid)
    return json_response({'type':'gaz:Location','locid':locid, 'defaultName':l.defaultName, 'names':encodeNames(names)})
   
def encodeNames(names):
    namelist = '{ '
    for n in names:
#        namelist += """{ 'name':"%s", 'language':"%s" } """.format(n.name,n.language)
        namelist += n.__unicode__()
    namelist += ' }'     
    return namelist
    
def recordname(req, locid):
    return HttpResponse('Not yet implemented', status=400)