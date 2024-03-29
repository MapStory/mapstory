from django.conf.urls import url
from django.contrib.auth.decorators import login_required

from .views import (JournalCreateView, JournalDetailView, JournalListView,
                   JournalUpdateView)

urlpatterns = [
    url(r'^$', JournalListView.as_view(), name='journal'),
    url(r'^(?P<pk>\d+)$', JournalDetailView.as_view(),
        name='journal-detail'),
    url(r'^write$', login_required(
        JournalCreateView.as_view()), name='journal-create'),
    url(r'^write/(?P<pk>\d+)$',
        login_required(JournalUpdateView.as_view()), name='journal-update'),
]
