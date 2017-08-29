from django.conf.urls import url

from . import views
urlpatterns = [
    url(r'(?P<org_pk>\d+)/(?P<membership_pk>\d+)/$', views.membership_detail, name='member_detail'),
    url(r'(?P<pk>\d+)/$', views.organization_detail, name='detail'),
    url(r'^$', views.organization_list, name='list'),
    url(r'(?P<pk>\d+)/add/layer/(?P<layer_pk>\d+)/$', views.add_layer, name='add_layer'),
    url(r'(?P<pk>\d+)/add/mapstory/(?P<mapstory_pk>\d+)/$', views.add_mapstory, name='add_mapstory'),
    url(r'(?P<pk>\d+)/add/member/(?P<user_pk>\d+)/$', views.add_membership, name='add_member'),
    url(r'(?P<pk>\d+)/manager/$', views.manager, name='manage'),
]
