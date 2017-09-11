from django.db import models
from django.conf import settings
from django.core.urlresolvers import reverse
from django.core.exceptions import SuspiciousOperation

from geonode.layers.models import Layer
from mapstory.mapstories.models import MapStory
from unidecode import unidecode
from django.template.defaultfilters import slugify


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
    city = models.CharField(default='', max_length=255)
    country = models.CharField(default='', max_length=255)
    image = models.FileField(null=True)


    class Meta:
        verbose_name_plural = 'Organizations'

    def __unicode__(self):
        return u'%s' % self.title

    def get_absolute_url(self):
        """Get absolute URL.

        URL for this organization.

        :return: A URL for this Organization.
        """
        return reverse('organizations:detail', kwargs={'pk': self.pk})

    def add_member(self, user, is_admin=False):
        """Adds a member to the Organization.

        Errors out if you try to add a member that already belongs.

        :param user: The user to be added.
        :param is_admin: Give admin powers to the user.
        :return: A OrganizationMembership object.
        """
        # Only add members if they are not already one
        membership_count = OrganizationMembership.objects.filter(user=user, organization=self).count()

        if membership_count > 0:
            raise SuspiciousOperation("Is already a member")

        return OrganizationMembership.objects.create(user=user, organization=self, is_admin=is_admin)

    def get_admin_memberships(self):
        """Get all memberships for this Organization.

        Returns a List of OrganizationMembership for this organization.

        :return: A list of OrganizationMemberships
        """
        return OrganizationMembership.objects.filter(organization=self, is_admin=True)

    def remove_member(self, user):
        """Removes a member's membership.

        Deletes a Membership for the given user.

        :param user: The user to be removed from the Organization
        """
        membership = OrganizationMembership.objects.get(user=user, organization=self)
        membership.delete()

    def promote_member_to_admin(self, user):
        """Gives the user admin rights.

        :param user: The user to be priviledged with admin.
        :return: The OrganizationMembership that was changed.
        """
        membership = OrganizationMembership.objects.get(user=user, organization=self)
        membership.is_admin = True
        membership.save()
        return membership

    def get_memberships(self):
        """Returns a list of all Memberships.

        :return: A list of memberships.
        """
        return OrganizationMembership.objects.filter(organization=self)

    def get_urls(self):
        """A list of Organization OrganizationURL's

        :return: A list of OrganizationURL's
        """
        return OrganizationURL.objects.filter(org=self)

    def add_url(self, url):
        """Adds a new URL to the Organization
        """
        return OrganizationURL.objects.create(url=url, org=self)

    def add_layer(self, layer, membership):
        """Adds a Layer to the Organization.

        :param layer: The Layer to be added.
        :param membership: Membership used for the transaction.
        :return: The OrganizationLayer object created.
        """
        # TODO: Check if membership is allowed to add layer
        return OrganizationLayer.objects.create(organization=self, layer=layer, membership=membership)

    def add_mapstory(self, mapstory, membership):
        """Adds a Mapstory to the Organization.
        :param mapstory: The mapstory to add.
        :param membership: The membership used for the transaction.
        :return: The OrganzationMapStory object created.
        """
        # TODO: Check if membership is allowed to add layer
        return OrganizationMapStory(mapstory=mapstory, organization=self, membership=membership)



class OrganizationURL(models.Model):
    """A Link that is displayed in the Organization's page."""
    url = models.CharField(max_length=255)
    org = models.ForeignKey(Organization)

    def __unicode__(self):
        return u'%s' % self.url



class OrganizationMembership(models.Model):
    """Represents a user's membership to an Organization.
    Links together a User and an Organization. The memberhisp can be deactivated
    and is the token used to identify all actions permormed by the user within
    the Organizaion (Add layers, Post journals, etc).
    A member can also act as an admin to an Organization, which is indicated by his Membership `is_admin` field.
    """
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
    """Represents a Layer that is sponsored by an Organization"""
    membership = models.ForeignKey(OrganizationMembership)
    organization = models.ForeignKey(Organization)
    layer = models.ForeignKey(Layer)
    created_at = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)
    is_featured = models.BooleanField(default=False)

    def __unicode__(self):
        return u'%s' % self.layer



class OrganizationSocialMedia(models.Model):
    """Represents a Social media Link shown on the Organization's detail Page"""
    organization = models.ForeignKey(Organization)
    name = models.CharField(max_length=255, default="blank")
    icon = models.CharField(max_length=255)
    url = models.URLField()

    def __unicode__(self):
        return u'%s' % self.url



class OrganizationMapStory(models.Model):
    """Represents a Mapstory that is sponsored by an Organization"""
    mapstory = models.ForeignKey(MapStory)
    organization = models.ForeignKey(Organization)
    membership = models.ForeignKey(OrganizationMembership)
    created_at = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)
    is_featured = models.BooleanField(default=False)

    def __unicode__(self):
        return u'%s' % self.mapstory
