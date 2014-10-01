import os
import re
from django.contrib.staticfiles.templatetags import staticfiles

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