import argparse
import requests
from requests.auth import HTTPBasicAuth
import logging
import xmltodict

parser = argparse.ArgumentParser(description="Enable GWC on Geoserver integrated layers",
    prog="enable_gwc.py", formatter_class=lambda prog: argparse.HelpFormatter(prog,max_help_position=40))
parser.add_argument('-url', '--base_url', metavar='', help='Geoserver URL' ,default='https://mapstory.org/geoserver')
parser.add_argument('-u', '--user', metavar='', help='Geoserver Admin username', default='admin')
parser.add_argument('-p', '--password', metavar='', help='Geoserver admin password', required=True)
parsed_args = parser.parse_args()

url = parsed_args.base_url
user = parsed_args.user
password = parsed_args.password

logging.basicConfig(
  level=logging.INFO,
  format='%(asctime)s %(name)-15s %(levelname)-8s %(lineno)d %(message)s',
  datefmt='%m-%d-%Y %H:%M:%S',
  filename='gwc_layers.log',
  filemode='a'
)

console = logging.StreamHandler()
console.setLevel(logging.INFO)
formatter = logging.Formatter('%(name)-10s: %(levelname)-8s %(message)s')
console.setFormatter(formatter)
logging.getLogger('').addHandler(console)
logger = logging.getLogger('logger')

gwc_layer_xml = '''<?xml version="1.0" encoding="UTF-8"?>
<GeoServerLayer>
  <enabled>true</enabled>
  <mimeFormats>
    <string>image/png</string>
    <string>image/jpeg</string>
    <string>image/png8</string>
  </mimeFormats>
  <gridSubsets>
    <gridSubset>
      <gridSetName>EPSG:900913</gridSetName>
    </gridSubset>
    <gridSubset>
      <gridSetName>EPSG:4326</gridSetName>
    </gridSubset>
    <gridSubset>
      <gridSetName>EPSG:3857</gridSetName>
    </gridSubset>
  </gridSubsets>
  <metaWidthHeight>
    <int>4</int>
    <int>4</int>
  </metaWidthHeight>
  <expireCache>0</expireCache>
  <expireClients>0</expireClients>
  <parameterFilters>
    <styleParameterFilter>
      <key>STYLES</key>
      <defaultValue/>
    </styleParameterFilter>
    <regexParameterFilter>
    	<key>TIME</key>
		<defaultValue/>
		<normalize>
			<locale/>
		</normalize>
		<regex>.*</regex>
    </regexParameterFilter>
  </parameterFilters>
  <gutter>0</gutter>
</GeoServerLayer>'''

def httpRequest(url, method, username, password, data):
  session = requests.Session()
  http_method_call = getattr(session, method)
  session.mount("https://", requests.adapters.HTTPAdapter(max_retries=10))
  if data:
    resp = http_method_call(url=url, auth=HTTPBasicAuth(user, password), data=data)
  else:
    resp = http_method_call(url=url, auth=HTTPBasicAuth(user, password))

  # for i in range(10):
    # try:
      # if data:
        # resp = http_method_call(url, auth=HTTPBasicAuth(user, password), data=data)
      # else:
        # resp = http_method_call(url, auth=HTTPBasicAuth(user, password))
    # except requests.exceptions.ConnectionError:
      # continue
    # break

  return resp

layers = {}
resp = httpRequest("{url}/rest/layers.json".format(url=url), 'get', user, password, {})
if resp.status_code == 200:
  layers = resp.json()
  logger.info('Got list of layers')
else:
  logger.critical('Failed to retrieve list of layers {error_code}, {error}'.format(error_code=resp.status_code, error=resp.text))

if layers:
  for layer in layers['layers']['layer']:
    gwc_layer = xmltodict.parse(gwc_layer_xml)
    resp = httpRequest(layer['href'], 'get', user, password, {})

    if resp.status_code == 200 and resp.content:
      # default_style = resp.json()['layer']['defaultStyle']['name']
      resp = httpRequest(resp.json()['layer']['resource']['href'], 'get', user, password, {})

      if resp.status_code == 200:
        data = resp.json()[resp.json().keys()[0]]
        workspace = data['namespace']['name']
        layer_name = data['name']

        gwc_layer['GeoServerLayer']['name'] = "{workspace}:{layer_name}".format(workspace=workspace, layer_name=layer_name)

        gwc_layer_time_support = False
        if "metadata" in data.keys() and "entry" in data['metadata'].keys():
          if isinstance(data['metadata']['entry'], list):
            for entry in data['metadata']['entry']:
              if "@key" in entry.keys() and entry['@key'] == "time":
                gwc_layer_time_support = True
                break
          elif isinstance(data['metadata']['entry'], dict):
            if "@key" in data['metadata']['entry'] and data['metadata']['entry']['@key'] == "time":
              gwc_layer_time_support = True

        if gwc_layer_time_support:
          gwc_layer['GeoServerLayer']['parameterFilters']['regexParameterFilter'] = {'key': 'TIME', 'defaultValue': None, 'regex': '.*'}
          logger.info('Layer has time {layer_name}'.format(layer_name=layer_name))

        gwc_layer_url = "{url}/gwc/rest/layers/{workspace}:{layer_name}.xml".format(url=url, workspace=workspace, layer_name=layer_name)
        resp = httpRequest(gwc_layer_url, 'post', user, password, xmltodict.unparse(gwc_layer))

        if resp.status_code == 200:
          logger.info('Successfully modified GWC layer {layer_url}'.format(layer_url=gwc_layer_url))
        elif resp.status_code == 404:
          resp = httpRequest(gwc_layer_url, 'put', user, password, xmltodict.unparse(gwc_layer))
          if resp.status_code == 200:
            logger.info('Successfully created GWC layer {layer_url}'.format(layer_url=gwc_layer_url))
          else:
            logger.critical('Failed to create GWC layer {layer_url}, {error}'.format(layer_url=gwc_layer_url, error=resp.content))
        else:
          logger.critical('Failed to modify GWC layer {layer_url}, {error}'.format(layer_url=gwc_layer_url, error=resp.content))
      else:
        logger.critical('Failed to get resource url {layer}'.format(layer=resp.json()['layer']['resource']['href']))
    else:
      logger.critical('Failed to get layer information {layer}'.format(layer=layer['href']))
