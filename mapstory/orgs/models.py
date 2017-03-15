from django.db import models
from django.utils import timezone
from django.utils.translation import ugettext_lazy as _
from django.db.models import signals
from geonode.base.enumerations import COUNTRIES
from geonode.groups.models import Group as Geonode_Group


class Org(models.Model):
    group = models.OneToOneField(Geonode_Group, on_delete=models.CASCADE)

    class Meta:
        app_label = "mapstory_groups"

    social_twitter = models.CharField(
        _('Twitter Handle'),
        help_text=_('Provide your Twitter handle or URL'),
        max_length=255,
        null=True,
        blank=True)

    social_facebook = models.CharField(
        _('Facebook Profile'),
        help_text=_('Provide your Facebook handle or URL'),
        max_length=255,
        null=True,
        blank=True)

    date_joined = models.DateTimeField(_('date joined'), default=timezone.now)

    city = models.CharField(
        _('City'),
        max_length=255,
        blank=True,
        null=True,
        help_text=_('city of the location'))

    country = models.CharField(
        choices=COUNTRIES,
        max_length=3,
        blank=True,
        null=True,
        help_text=_('country of the physical address'))

    tasks = models.TextField(null=True, blank=True)

    profile_type = models.CharField(
        null=True,
        choices=[['org', 'Organization'], ['ini', 'Initiative']],
        max_length=255)

    featured = models.BooleanField(
        default=False,
        help_text=_('Should this resource be advertised in home page?'))

    def interest_list(self):
        """
        Returns a list of the Group's interests.
        """
        return [interest.name for interest in self.interests.all()]

def create_org(sender, instance, created, **kwargs):
    if created:
        Geonode_Group.objects.create(user=instance)

def save_org(sender, instance, **kwargs):
    instance.org.save()

signals.post_save.connect(create_org, sender=Geonode_Group)
signals.post_save.connect(save_org, sender=Geonode_Group)
