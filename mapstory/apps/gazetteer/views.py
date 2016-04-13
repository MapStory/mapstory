from django.shortcuts import render
from django.db import transaction
from django.db.models import F
from django.http import HttpResponse, Http404
from geonode.utils import json_response
import json
from mapstory.apps.gazetteer.models import Location, LocationName, LocationType
from mapstory.apps.gazetteer.harvest import harvestlayer

from django.views.decorators.csrf import csrf_exempt
@csrf_exempt

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

@csrf_exempt
def matchloc(req, *args, **kwargs):
    """
    Find a matching location based on a gazetteer entry with multiple possible names and codes
    call match with flag not to create if missing
    """
    return _matchloc(req, insert=False )

@csrf_exempt
def updateloc(req, *args, **kwargs):
    """
    Find a matching location based on a gazetteer entry with multiple possible names and codes
    call match with flag to create if missing and at least one unambiguous featurecode is present
    """
    return _matchloc(req, insert=True )
    
def _matchloc(req,insert):
    # import ipdb; ipdb.set_trace()
    try:
        if req.method == 'POST':
            locobj = json.loads(req.body)
            names = locobj['names']
            typecode = locobj['locationType']
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
        
            typecode = req.GET['locationType']
        else :
            HttpResponse('method not supported', status=404) 
            
        # we'll build up lists of location ids for different matching strategies. The client will then have to decide how aggressive to be with accepting answers and dealing with inconsistencies.
        match_ids = { 'code':[] , 'name_lang':[], 'name':[] } 
        
        # list of codes found
        codes = []
        
        for nameobj in names: 
            if not nameobj.has_key('name') :
                # malformed 
                raise ValueError('Missing element (name) in gazetteer object')
            elif not nameobj.get('name') :
                # skip a null entry - thats OK
                continue
            elif nameobj.get('namespace'):
                codes.append( nameobj )
                namelist = LocationName.objects.filter( name=nameobj['name'], namespace=nameobj['namespace'] )
                # should be just one here - but we'll get a list of all found and check this later
                for n in  namelist :
                    match_ids['code'].append(n.location.id)
            elif nameobj.get('language'):
                namelist = LocationName.objects.filter( name=nameobj['name'], language=nameobj['language'], location__locationType=typecode )    
                if namelist :
                    for n in  namelist :
                        match_ids['name_lang'].append(n.location.id)
            else :
                namelist = LocationName.objects.filter( name=nameobj['name'], location__locationType=typecode)    
                if namelist :
                    for n in  namelist :
                        match_ids['name'].append(n.location.id) 

    
            
        # now get details of locations from the ids, deduplicating as we go 
        matches = {}
        # we may make this controllable later
   
        strategy = 'bestonly' 
        
        for matchtype in ["code", "name_lang", "name"] :
            if match_ids.get( matchtype ) :
                for locid in  match_ids[matchtype] :
                    if not matches.get(locid) :
                        matches[locid] = {"matchtype":matchtype,"locobj":Location.objects.get(id=locid)}
                if strategy == 'bestonly' and matches :
                    break
        
        # now perform basic validation:
        count_codes = 0
        codematch = [] 
        namelangmatch = []
        namematch=[]
        definitiveloc = None
        for loc in matches.keys() :
            # count number of code matches - more than one will indicate some error
            if matches[loc]['matchtype'] == 'code' :
                count_codes += 1
                codematch.append(_encodeLoc(loc,matches[loc]['locobj']))
                definitiveloc = loc
            elif matches[loc]['matchtype'] == 'name_lang' :  
                namelangmatch.append(_encodeLoc(loc,matches[loc]['locobj']))
            elif matches[loc]['matchtype'] == 'name' :  
                namematch.append(_encodeLoc(loc,matches[loc]['locobj']))
            # else :
                # check 
        
        if count_codes > 1 :
            raise ValueError('duplicate records found for feature identifiers  : '+ codematch) 
        elif count_codes == 0 and insert and codes :
            # there were codes provided but no match was made - so we can search for and insert this as a new location if missing
            loc = _insertloc(locobj)
            if loc :
                definitiveloc = loc.id
        
        if insert and definitiveloc:
            for nameobj in names:
                if nameobj.get('name') :
                    _recordname(nameobj,definitiveloc)
                

        
        return json_response({'code':codematch, 'name_lang':namelangmatch, 'name':namematch } )

    except Exception as e:
        import ipdb; ipdb.set_trace()   
        return HttpResponse(e, status=400)
    
# return empty list    
    return HttpResponse('[]', status=200)

def _insertloc(locobj):
    """
        insert a new location object, and record each name provided for it
    """
    # import ipdb; ipdb.set_trace()
    locationType=LocationType.objects.get(code=locobj['locationType'])
    if not locationType :
        raise ValueError ('Invalid location type ' + locobj['locationType'])   
  
    return Location.objects.create(defaultName=locobj['defaultName'], locationType=locationType, latitude=locobj['latitude'] , longitude=locobj['latitude'] )
 
    
def recordname(req, locid):
# dumbly assume POST for now
    status = 'hit me'
#    pdb.set_trace()
    try:
        nameobj = json.loads(req.body)
        status = 'got json'
        status = _recordname(nameobj,locid)
    except Exception as e:
        return HttpResponse(e, status=400)
            
    return HttpResponse(status, status=200)
    
def _recordname(nameobj,locid) :
    loc = Location.objects.get(id=locid)
    status = 'got loc'
    (obj, created) = LocationName.objects.get_or_create(
    location = loc, name=nameobj['name'], language=nameobj.get('language'),defaults = nameobj )
    status = 'location created ' + str(created)
    if not created:
        # obj.extra_field = 'some_val'
        status =  'updating counts for ' + F( obj.name) 
    return status