from django.db import models
from django.conf import settings
from django.core.urlresolvers import reverse


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
    admin_user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='organization_admin_type')
    members = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='org_mapstory_members')

    def __unicode__(self):
        return u'%s' % self.title

    def get_absolute_url(self):
        """Get absolute URL.

        URL for this organization.

        :return: A URL for this Organization.
        """
        return reverse('organizations:detail', args=[self.pk])

    def get_members(self):
        """Get all members.

        Returns a list of all members belonging to this organization.

        :return: []: A List of Users
        """
        # TODO:(Zunware) Implement a query to get all memebrs that belong to the organization
        pass

    def get_admin(self):
        """Get admin user.

        Returns this organization's admin user.

        :return: User: The admin user.
        """
        # TODO:(Zunware) Implement get_admin()
        pass

    def set_admin(self, user):
        """Set Admin.

        Sets the admin for this group.
        """

    def get_layers(self):
        """Get all Layers.

        Returns all Layers for this Organization.

        :return: []: A list of Layers.
        """
        # TODO: (Zunware) Implement a query to get all layers
        pass

    def get_mapstories(self):
        """Get MapStories.

        Returns all MapStories for this Organization

        :return: A list of MapStories.
        """
        # TODO: (Zunware) Implement a query to get mapstories
        pass

    def get_journal_posts(self):
        """Get Journal posts.

        Returns all Jorunal Posts for this Organization.

        :return: A list of Journal Posts.
        """
        # TODO: (Zunware) Implement a query to get all posts
        pass


    class Meta:
        verbose_name_plural = 'Organizations'
