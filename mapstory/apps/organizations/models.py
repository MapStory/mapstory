from django.db import models
from django.conf import settings
from django.core.urlresolvers import reverse
from django.core.exceptions import SuspiciousOperation
from django.utils.text import slugify

from geonode.layers.models import Layer
from mapstory.mapstories.models import MapStory
from mapstory.apps.teams.models import Team


class OrganizationSocialMedia(models.Model):
    """Represents a Social media Link shown on the Organization's detail Page"""
    name = models.CharField(max_length=255)
    icon = models.CharField(max_length=255)
    url = models.URLField()

    def __unicode__(self):
        return u'%s' % self.url


class OrganizationURL(models.Model):
    """A Link that is displayed in the Organization's page."""
    url = models.URLField(max_length=255)

    def __unicode__(self):
        return u'%s' % self.url


class Organization(Team):
    """Represents an Organization.
    An Organization has:
        - Many Members
        - Many Admins
        - Many StoryLayers
        - Many MapStories
        - Many Icons
        - Many journal posts

    """
    image = models.ImageField(null=True, blank=True, upload_to='org_profiles')
    facebook = models.ForeignKey(OrganizationSocialMedia, blank=True, null=True, related_name='facebook')
    twitter = models.ForeignKey(OrganizationSocialMedia, blank=True, null=True, related_name='twitter')
    instagram = models.ForeignKey(OrganizationSocialMedia, blank=True, null=True, related_name='instagram')
    github = models.ForeignKey(OrganizationSocialMedia, blank=True, null=True, related_name='github')
    linkedin = models.ForeignKey(OrganizationSocialMedia, blank=True, null=True, related_name='linkedin')
    url0 = models.ForeignKey(OrganizationURL, blank=True, null=True, related_name="url0")
    url1 = models.ForeignKey(OrganizationURL, blank=True, null=True, related_name="url1")
    url2 = models.ForeignKey(OrganizationURL, blank=True, null=True, related_name="url2")
    slug = models.SlugField(max_length=255, unique=True, null=True, blank=True)

    class Meta:
        verbose_name_plural = 'Organizations'

    def __unicode__(self):
        return u'%s' % self.name

    def save(self, *args, **kwargs):
        """
        Overrides save.
        Creates a slug if the object is new.
        :param args: argList
        :param kwargs: argDict
        :return:
        """
        if not self.slug:
            # Ensure uniqueness:
            slug = slugify(self.name)
            if not Organization.objects.filter(slug=slug).exists():
                self.slug = slug
            else:
                count = 1
                while Organization.objects.filter(slug=slug).exists():
                    count += 1
                    slug = "%s%s" % (slug, str(count))
                self.slug = slug

        super(Organization, self).save(*args, **kwargs)

    def get_absolute_url(self):
        """Get absolute URL.

        URL for this organization.

        :return: A URL for this Organization.
        """
        return reverse('organizations:detail', kwargs={'slug': self.slug})

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

        Removes a membership by making it inactive.

        :param user: The user to be removed from the Organization
        """
        memberships = OrganizationMembership.objects.filter(user=user, organization=self)
        if memberships.count() > 0:
            for membership in memberships:
                membership.is_active = False
                membership.save()

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
        return OrganizationMembership.objects.filter(organization=self, is_active=True)

    def get_urls(self):
        """A list of Organization OrganizationURL's

        :return: A list of OrganizationURL's
        """
        return OrganizationURL.objects.filter(org=self)

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
        return OrganizationMapStory.objects.create(mapstory=mapstory, organization=self, membership=membership)

    def get_member_count(self):
        return OrganizationMembership.objects.filter(organization=self).count()

    def get_layer_count(self):
        return OrganizationLayer.objects.filter(organization=self).count()

    def get_mapstory_count(self):
        return OrganizationMapStory.objects.filter(organizastion=self).count()


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
        return u'%s - %s' % (self.organization, self.user)

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


class OrganizationMapStory(models.Model):
    """
    Represents a Mapstory that is sponsored by an Organization
    """
    mapstory = models.ForeignKey(MapStory)
    organization = models.ForeignKey(Organization)
    membership = models.ForeignKey(OrganizationMembership)
    created_at = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)
    is_featured = models.BooleanField(default=False)

    def __unicode__(self):
        return u'%s' % self.mapstory


class JoinRequest(models.Model):
    """
    Represents a request from a user to join the Organization. Must be approved by an admin.
    """
    organization = models.ForeignKey(Organization)
    user = models.ForeignKey(settings.AUTH_USER_MODEL)
    created_at = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)
    is_open = models.BooleanField(default=True)
    approved_by = models.ForeignKey(OrganizationMembership, blank=True, null=True)

    def approve(self, admin_membership):
        """
        Approve a request for membership.
        :param admin_membership: The admin's membership that approves the request.
        :return: A new membership if success, None if fails.
        """
        if admin_membership.is_admin is False:
            # TODO: Log suspicious activity
            return None

        new_membership = OrganizationMembership()
        new_membership.organization = self.organization
        new_membership.user = self.user
        new_membership.save()

        self.approved_by = admin_membership
        self.is_open = False
        self.save()

        return new_membership

    def decline(self, admin_membership):
        if not admin_membership.is_admin:
            return None

        self.is_open = False
        self.save()
