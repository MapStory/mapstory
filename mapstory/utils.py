import logging
import os
import re

from django.contrib.staticfiles.templatetags import staticfiles
from django.http import HttpResponse

from lxml import etree

logger = logging.getLogger(__name__)

DEFAULT_VIEWER_PLAYBACKMODE = "Instant"


def parse_schema(schema_xml_str):
    xml = etree.XML(schema_xml_str)
    tree = etree.ElementTree(xml)
    root = tree.getroot()
    for ns in root.nsmap:
        xpath_ns = etree.FunctionNamespace(root.nsmap[ns])
        xpath_ns.prefix = ns
    sequences = tree.xpath('//xsd:schema/xsd:complexType/xsd:complexContent/xsd:extension/xsd:sequence/xsd:element')
    schema_source = {}
    for element in sequences:
        schema_source[element.attrib['name']] = element.attrib['type']
    return schema_source


def error_response(status_code, text):
    return HttpResponse(status=status_code, content=text)


def has_exception(response_xml):
    xml = etree.XML(response_xml)
    tree = etree.ElementTree(xml)
    root = tree.getroot()
    # if prefix 'ows' is not define in the xml file, then ows:Exception won't exist either
    if 'ows' not in root.nsmap:
        return False

    exceptions = root.findall('.//ows:Exception', root.nsmap)
    return len(exceptions) == 0


def print_exception(response_xml):
    xml = etree.XML(response_xml)
    tree = etree.ElementTree(xml)
    root = tree.getroot()
    exceptions = root.findall('.//ows:Exception',root.nsmap)
    for exception in exceptions:
        logger.warning('Insert exception {0}: {1}'.format(exception.tag, exception.text))


def parse_wfst_response(schema_xml_str):
    xml = etree.XML(schema_xml_str)
    tree = etree.ElementTree(xml)
    root = tree.getroot()
    for ns in root.nsmap:
        xpath_ns = etree.FunctionNamespace(root.nsmap[ns])
        xpath_ns.prefix = ns
    summary_element = tree.xpath('//wfs:TransactionResponse/wfs:TransactionSummary')
    summary = {}
    for child in summary_element[0].getchildren():
        summary[child.tag.split('}')[1]] = child.text
    return summary


class Link(object):

    def __init__(self, href, name=None):
        self.href = href
        self.name = name

    def is_image(self):
        ext = os.path.splitext(self.href)[1][1:].lower()
        return ext in ('gif','jpg','jpeg','png')

    def _get_link(self, *paths):
        prefix = 'https?://(?:w{3}\.)?'
        for p in paths:
            match = re.match(prefix + p, self.href)
            if match:
                return match.group(1)

    def get_youtube_video(self):
        return self._get_link(
            'youtube.com/watch\?v=(\S+)',
            'youtu.be/(\S+)',
            'youtube.com/embed/(\S+)',
        )

    def get_twitter_link(self):
        return self._get_link('twitter.com/(\S+)')

    def get_facebook_link(self):
        return self._get_link('facebook.com/(\S+)')

    def render(self, width=None, height=None, css_class=None):
        '''width and height are just hints - ignored for images'''

        ctx = dict(href=self.href, link_content=self.name or self.href, css_class=css_class, width='', height='')
        if self.is_image():
            return '<img class="%(css_class)s" src="%(href)s" title="%(link_content)s"></img>' % ctx

        video = self.get_youtube_video()
        if video:
            ctx['video'] = video
            ctx['width'] = 'width="%s"' % width
            ctx['height'] = 'height="%s"' % height
            return ('<iframe class="youtube-player" type="text/html"'
                    ' %(width)s %(height)s frameborder="0"'
                    ' src="http://www.youtube.com/embed/%(video)s">'
                    '</iframe>') % ctx

        known_links = [
            (self.get_twitter_link, staticfiles.static('img/twitter.png')),
            (self.get_facebook_link, staticfiles.static('img/facebook.png')),
        ]
        for fun, icon in known_links:
            if fun():
                ctx['link_content'] = '<img src="%s" border=0>' % icon
                break

        return '<a target="_" href="%(href)s">%(link_content)s</a>' % ctx
