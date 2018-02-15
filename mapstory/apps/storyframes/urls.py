from django.conf.urls import patterns, url


urlpatterns = patterns(
    'mapstory.apps.storyframes.views',
    url(r'^$', 'storyframes', name='storyframes'),
)
