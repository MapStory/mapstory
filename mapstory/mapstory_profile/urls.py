from django.conf.urls import url

from .views import ProfileDetail, profile_delete, profile_edit

urlpatterns = [
    url(r"^storyteller/(?P<slug>[^/]*)/$",
        ProfileDetail.as_view(), name="profile_detail"),
    url(r"^storyteller/edit/(?P<username>[^/]*)/$",
        profile_edit, name="profile_edit"),
    url(r"^storyteller/delete/(?P<username>[^/]*)/$", profile_delete, name="profile_delete")
]
