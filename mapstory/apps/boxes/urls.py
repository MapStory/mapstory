from django.conf.urls import patterns, url


urlpatterns = patterns(
    'mapstory.apps.boxes.views',
    url(r'^$', 'boxes', name='boxes'),
)
