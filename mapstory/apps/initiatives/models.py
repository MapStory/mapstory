from django.db import models
from django.conf import settings
from django.core.exceptions import SuspiciousOperation
from django.core.urlresolvers import reverse
from django.utils.text import slugify

from geonode.layers.models import Layer
from mapstory.mapstories.models import MapStory


class Initiative(models.Model):
    """
    The ability to assess and initiate things independently.
    """
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    slug = models.SlugField(max_length=255, blank=True, null=True)
    slogan = models.CharField(max_length=255)
    about = models.TextField(default='')
    is_active = models.BooleanField(default=True)
    last_updated = models.DateTimeField(auto_now=True)
    city = models.CharField(default='', max_length=255)
    country = models.CharField(default='', max_length=255)
    image = models.ImageField(null=True, blank=True, upload_to='initiatives')

    def __unicode__(self):
        return self.name

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
            if not Initiative.objects.filter(slug=slug).exists():
                self.slug = slug
            else:
                count = 1
                while Initiative.objects.filter(slug=slug).exists():
                    count += 1
                    slug = "%s%s" % (slug, str(count))
                self.slug = slug

        super(Initiative, self).save(*args, **kwargs)

    def get_absolute_url(self):
        """Get absolute URL.

        URL for this Initiative.

        :return: A URL for this Initiative.
        """
        return reverse('initiatives:detail', kwargs={'slug': self.slug})

    def add_member(self, user, is_admin=False):
        """Adds a member to the initiative.

        Errors out if you try to add a member that already belongs.

        :param user: The user to be added.
        :param is_admin: Give admin powers to the user.
        :return: A InitiativeMembership object.
        """
        # Only add members if they are not already one
        membership_count = InitiativeMembership.objects.filter(user=user, initiative=self).count()

        if membership_count > 0:
            raise SuspiciousOperation("Is already a member")

        return InitiativeMembership.objects.create(user=user, initiative=self, is_admin=is_admin)


class InitiativeMembership(models.Model):
    """Represents a user's membership to an Initiative.
    Links together a User and an Initiative. The memberhisp can be deactivated
    and is the token used to identify all actions permormed by the user within
    the Initiative (Add layers, Post journals, etc).
    A member can also act as an admin to an initiative, which is indicated by his Membership `is_admin` field.
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL)
    initiative = models.ForeignKey(Initiative)
    member_since = models.DateTimeField(auto_now=True)
    is_admin = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)

    def __unicode__(self):
        return u'%s - %s' % (self.initiative, self.user)

    class Meta:
        verbose_name_plural = 'Memberships'


class JoinRequest(models.Model):
    """
    Represents a request from a user to join the initiative. Must be approved by an admin.
    """
    initiative = models.ForeignKey(Initiative)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='initiatives_request')
    created_at = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)
    is_open = models.BooleanField(default=True)
    approved_by = models.ForeignKey(InitiativeMembership, blank=True, null=True)

    def approve(self, admin_membership):
        """
        Approve a request for membership.
        :param admin_membership: The admin's membership that approves the request.
        :return: A new membership if success, None if fails.
        """
        if admin_membership.is_admin is False:
            # TODO: Log suspicious activity
            return None

        new_membership = InitiativeMembership()
        new_membership.initiative = self.initiative
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


class InitiativeLayer(models.Model):
    """Represents a Layer that is sponsored by an Initiative"""
    membership = models.ForeignKey(InitiativeMembership)
    initiative = models.ForeignKey(Initiative)
    layer = models.ForeignKey(Layer)
    created_at = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)
    is_featured = models.BooleanField(default=False)

    def __unicode__(self):
        return u'%s' % self.layer


class InitiativeMapStory(models.Model):
    """
    Represents a Mapstory that is sponsored by an Initiative
    """
    mapstory = models.ForeignKey(MapStory)
    initiative = models.ForeignKey(Initiative)
    membership = models.ForeignKey(InitiativeMembership)
    created_at = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)
    is_featured = models.BooleanField(default=False)

    def __unicode__(self):
        return u'%s' % self.mapstory
