from django.conf.urls import url

from . import views
urlpatterns = [
    url(r'(?P<org_pk>\d+)/(?P<membership_pk>\d+)/$', views.membership_detail, name='member_detail'),
    url(r'(?P<pk>\d+)/$', views.organization_detail, name='detail'),
    url(r'^$', views.organization_list, name='list'),
]

