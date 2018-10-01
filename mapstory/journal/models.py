from django.db import models
from django.conf import settings
from django.core.urlresolvers import reverse
from datetime import datetime
import textile

class ContentMixin(models.Model):
    content = models.TextField(
        help_text="use <a href=%s target='_'>textile</a> for the content" %
        'http://redcloth.org/hobix.com/textile/'
    )
    date = models.DateTimeField(default=datetime.now)
    publish = models.BooleanField(default=False)

    def html(self):
        return textile.textile(self.content)

    class Meta:
        abstract = True
        ordering = ['-date']


class JournalEntry(ContentMixin):
    title = models.CharField(max_length=255)
    author = models.ForeignKey(settings.AUTH_USER_MODEL)
    show_on_main = models.BooleanField(default=False)

    def __unicode__(self):
        return u'%s' % (self.title)

    def get_absolute_url(self):
        return reverse('journal-detail', args=[self.pk])

    def published_count(self):
        return JournalEntry.objects.filter(publish=True).count()

    class Meta:
        verbose_name_plural = 'JournalEntries'


def get_group_journals(group_profile):
    users = group_profile.group.user_set.all()
    journals = []
    for user in users:
        journals.append(JournalEntry.objects.filter(author=user))

    return [item for sublist in journals for item in sublist]