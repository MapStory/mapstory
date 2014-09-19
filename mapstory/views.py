from django.views.generic import TemplateView

from mapstory.models import get_sponsors


class IndexView(TemplateView):
    template_name = 'index.html'
    def get_context_data(self, **kwargs):
        ctx = super(IndexView, self).get_context_data(**kwargs)
        ctx['sponsors'] = get_sponsors()
        return ctx
