from django.shortcuts import render
from django.db import transaction
from django.db.models import F
from django.http import HttpResponse, Http404
from django.core.urlresolvers import reverse
from geonode.utils import json_response
import json
# from mapstory.models import Location, LocationName
import psycopg2
import psycopg2.extras
import requests



def harvestlayer(req, layerid):
    """
        Get data for a layer and its harvest config and harvest to gazetteer.
        for each feature, build gaz object - then use to match, insert if necessary,  and record name usages
    """
 
   
    # get identified layer
    sourcelayer = _getlayer(layerid)
    # get the harvest mappings for that layer - or throw 400 if not available
    harvestconfig = _getharvestconfig(sourcelayer)
    if not harvestconfig :
        return HttpResponse(
            "Harvest configuration not found",
            mimetype="text/plain",
            status=400)
            
    # get an iterator over the features for that layer
    
    f_processed = 0
    f_added = 0
    newnames = 0
    updatednames = 0
    
    try:
        conn = _get_sourceconn(sourcelayer)
        for f in _getfeatures(conn, harvestconfig) :
            (newloc, newnamecount, updatenamecount) =  _updategaz(req,f,harvestconfig)
            if newloc :
                f_added += 1
            f_processed += 1
            newnames += newnamecount
            updatednames += updatenamecount
    except Exception as e:
        import ipdb; ipdb.set_trace() 
        if conn :
            conn.close()
        
    return json_response({'features':f_processed, 'added':f_added, 'layer':layerid})

def _getlayer(layerid):
    return None

def _get_sourceconn(sourcelayer) :
   # get db connection
    connect_params = "host=localhost dbname=mapstory_data user=mapstory password=foobar"
    return psycopg2.connect(connect_params) 

def _getfeatures(conn,config):
    """
        Yields a feature iterator. Each feature is a dict
        Throws exceptions
        May want to switch to server-side cursor.
    """
    cur = conn.cursor(cursor_factory = psycopg2.extras.RealDictCursor)
    SQL = "select * from tu_sample3" 
    if config.get('filter') :
        filterclause = 'WHERE '

        # process clauses in an injection-safe way and append to SQL 
    cur.execute(SQL)
    for r in cur :
        yield r
    # refactor if necessary to force connection close on failure
    
def _updategaz(req,f,config):
    """
        convert a feature to a gaz JSON structure and post it to the gazetteer transaction API
    """
    try:
        gazobj = {}
        if config.get('locationTypeField') :
            loc_type_normalised = f[config.get('locationTypeField')['field']]
        elif config.get('locationType') :
            loc_type_normalised = config.get('locationType')
            if not loc_type_normalised :
                raise ValueError ('Cannot find standard location type matching ' + config.get('locationType') )
        else :
            raise ValueError ('No valid location type specification found')
            
        gazobj['locationType'] = loc_type_normalised
        gazobj['latitude'] = f[config['lat_field']]
        gazobj['longitude'] = f[config['long_field']]
        gazobj['defaultName'] = f[config['defaultNameField']]
        
    
        # now record all the names - the API wont insert unless it finds a code, and no matches for that code.
        gazobj['names'] = []
        for namefield in config.get('codes') :
            gazobj['names'].append( {'name':f[namefield['field']],'namespace':namefield['namespace']})
        for namefield in config.get('names') :
            if namefield.get('languageField') and f.get(namefield['languageField']) :
                lang = f[namefield['languageField']]
            elif namefield.get('language') :
                lang = namefield['language']
            else :
                lang = None 
            gazobj['names'].append( {'name':f[namefield['field']],'language':lang})
        # now post to the transaction API
        # import ipdb; ipdb.set_trace() 
        requests.post( req.build_absolute_uri(reverse('updateloc')),data=json.dumps(gazobj))
    except Exception as e:
        import ipdb; ipdb.set_trace()
        raise e
        
    return (True, 0, 0)
    
def _getharvestconfig(sourcelayer):
    config = {
        'filter': None , 
        'locationTypeField' : { 'field': 'dsg', 'namespace':'http://geonames.nga.mil/def/fc/' },
        'defaultNameField' : 'full_name_' ,
        'codes' : [ 
            {'field': 'ufi', 'namespace':'http://geonames.nga.mil/id/', 'uid':True  }
            ],
        'names' : [
            {'field': 'full_name_', 'languageField':'LC' , 'languageNamespace':'http://geonames.nga.mil/def/lang/','language':None, 'name_type':'Endonym'},
            {'field': 'full_nam_1', 'languageField':'LC' ,'language':'en', 'languageNamespace':'http://geonames.nga.mil/def/lang/', 'name_type':'Exonym'},
            {'field': 'short_form', 'languageField':'LC' ,'language':'en', 'languageNamespace':'http://geonames.nga.mil/def/lang/', 'name_type':'Exonym'}
            ],
        'partOf' : [
            {'field': 'cc1', 'namespace':'http://id.sirf.net/id/siset/UNGEGN'},
            ],
            
        'lat_field' : 'lat',
        'long_field' : 'long',
        'geom_field' : None,
        }
    return( config )