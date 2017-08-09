from django.db import models
from django.conf import settings
from django.core.urlresolvers import reverse
from django.core.exceptions import SuspiciousOperation

from geonode.layers.models import Layer
from mapstory.mapstories.models import MapStory


class Organization(models.Model):
    """Represents an Organization.
    An Organization has:
        - Many Members
        - Many Admins
        - Many StoryLayers
        - Many MapStories
        - Many Icons
        - Many journal posts

    """
    title = models.CharField(max_length=255)
    slogan = models.CharField(max_length=255, default='')
    about = models.TextField(default='')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Organizations'

    def __unicode__(self):
        return u'%s' % self.title

    def get_absolute_url(self):
        """Get absolute URL.

        URL for this organization.

        :return: A URL for this Organization.
        """
        return reverse('organization:detail', kwargs={'pk': str(self.pk)})

    def add_member(self, user, is_admin=False):
        # Only add members if they are not already one
        has_membership = OrganizationMembership.objects.filter(user=user, organization=self).exists()

        if has_membership:
            raise SuspiciousOperation("Is already a member")

        return OrganizationMembership.objects.create(user=user, organization=self, is_admin=is_admin)

    def get_admin_memberships(self):
        return OrganizationMembership.objects.filter(organization=self, is_admin=True)

    def remove_member(self, user):
        membership = OrganizationMembership.objects.get(user=user, organization=self)
        membership.delete()

    def promote_member_to_admin(self, user):
        membership = OrganizationMembership.objects.get(user=user, organization=self)
        membership.is_admin = True
        membership.save()
        return membership

    def get_memberships(self):
        return OrganizationMembership.objects.filter(organization=self)

    def get_urls(self):
        return OrganizationURL.objects.filter(org=self)

    def add_url(self, url):
        return OrganizationURL.objects.create(url=url, org=self)

    def add_layer(self, layer, membership):
        # TODO: Check if membership valid before adding the layer
        return OrganizationLayer.objects.create(organization=self, layer=layer, membership=membership)

    def add_mapstory(self, mapstory, membership):
        # TODO: Check if membership valid before adding mapstory
        return OrganizationMapStory(mapstory=mapstory, organization=self, membership=membership)




class OrganizationURL(models.Model):
    url = models.CharField(max_length=255)
    org = models.ForeignKey(Organization)

    def __unicode__(self):
        return u'%s' % self.url



class OrganizationMembership(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL)
    organization = models.ForeignKey(Organization)
    member_since = models.DateTimeField(auto_now=True)
    is_admin = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)

    def __unicode__(self):
        return u'%s' % self.user

    class Meta:
        verbose_name_plural = 'Memberships'



class OrganizationLayer(models.Model):
    membership = models.ForeignKey(OrganizationMembership)
    organization = models.ForeignKey(Organization)
    layer = models.ForeignKey(Layer)
    created_at = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)

    def __unicode__(self):
        return u'%s' % self.layer



class OrganizationSocialMedia(models.Model):
    organization = models.ForeignKey(Organization)
    icon = models.CharField(max_length=255)
    url = models.URLField()

    def __unicode__(self):
        return u'%s' % self.url



class OrganizationMapStory(models.Model):
    mapstory = models.ForeignKey(MapStory)
    organization = models.ForeignKey(Organization)
    membership = models.ForeignKey(OrganizationMembership)
    created_at = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)

    def __unicode__(self):
        return u'%s' % self.mapstory
