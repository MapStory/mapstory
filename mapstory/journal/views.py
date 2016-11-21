from django.core.exceptions import PermissionDenied
from django.core.urlresolvers import reverse
from django.views.generic.detail import DetailView
from django.views.generic.list import ListView
from django.views.generic.edit import CreateView, ModelFormMixin, UpdateView
from models import JournalEntry


class JournalListView(ListView):
    template_name = 'journal/journal.html'
    context_object_name = 'entries'
    paginate_by = 10

    def get_queryset(self):
        return JournalEntry.objects.filter(publish=True).order_by('-date')

    def get_context_data(self, **kwargs):
        ctx = super(JournalListView, self).get_context_data(**kwargs)
        user = self.request.user
        if user.is_authenticated():
            ctx['drafts'] = JournalEntry.objects.filter(author=user, publish=False)
        return ctx


class JournalPermissionMixin(object):
    need_publish = False

    def get_object(self, *args, **kwargs):
        obj = super(JournalPermissionMixin, self).get_object(*args, **kwargs)
        user = self.request.user
        if self.need_publish:
            can_view = obj.publish
        else:
            can_view = user.is_superuser or obj.author == self.request.user
        if not can_view:
            raise PermissionDenied()
        return obj


class JournalDetailView(JournalPermissionMixin, DetailView):
    template_name = 'journal/journal_detail.html'
    model = JournalEntry
    need_publish = True
    context_object_name = 'entry'

    def get_context_data(self, **kwargs):
        ctx = super(JournalDetailView, self).get_context_data(**kwargs)
        return ctx


class JournalEditMixin(object):
    template_name = 'journal/journal_edit.html'
    model = JournalEntry
    fields = ['title', 'content', 'publish']

    def get_success_url(self):
        return reverse('journal')


class JournalCreateView(JournalEditMixin, CreateView):

    def form_valid(self, form):
        self.object = form.save(commit=False)
        self.object.author = self.request.user
        self.object.save()
        return super(ModelFormMixin, self).form_valid(form)


class JournalUpdateView(JournalEditMixin, JournalPermissionMixin, UpdateView):
    pass