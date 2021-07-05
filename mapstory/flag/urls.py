from django.conf.urls import url
from django.views.generic import TemplateView

from mapstory.flag.views import flag

urlpatterns = [
    url(r"^$", flag, name="flag"),
    url(r'^thank_you', TemplateView.as_view(
        template_name="flag/thank_you.html"), name='flag-reported'),
]
