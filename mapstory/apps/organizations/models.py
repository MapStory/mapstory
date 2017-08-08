from django.db import models
from django.conf import settings
from django.core.urlresolvers import reverse
from django.core.exceptions import SuspiciousOperation


class Organization(models.Model):
    """Represents an Organization.

    An Organization has multiple members and one admin.
    When a member creates an resource (MapStories or StoryLayers) it
    can then be attributed to the Organization.

    An Organization has:
        - Many Members
        - One Admin
        - Many StoryLayers
        - Many MapStories
        - Many Icons
        - Many journal posts

    """
    title = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name_plural = 'Organizations'

    def __unicode__(self):
        return u'%s' % self.title

    def get_absolute_url(self):
        """Get absolute URL.

        URL for this organization.

        :return: A URL for this Organization.
        """
        return reverse('organization_detail', kwargs={'orgid': str(self.pk)})

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



class OrganizationURL(models.Model):
    url = models.CharField(max_length=255)
    org = models.ForeignKey(Organization)


class OrganizationMembership(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL)
    organization = models.ForeignKey(Organization)
    member_since = models.DateTimeField(auto_now=True)
    is_admin = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)