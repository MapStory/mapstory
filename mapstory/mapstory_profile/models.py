from django.db import models
from django.utils.translation import ugettext_lazy as _
from django.db.models import signals
from geonode.people.models import Profile as Geonode_Profile
from avatar.templatetags.avatar_tags import avatar_url
from avatar.models import Avatar
from taggit.managers import TaggableManager


class MapstoryProfile(models.Model):
    user = models.OneToOneField(Geonode_Profile, on_delete=models.CASCADE)

    class Meta:
        app_label = "mapstory_profile"

    interests = TaggableManager(_('interests'), blank=True, help_text=_(
        'A list of personal interests (separate each interest with a comma)'))

    Volunteer_Technical_Community = models.BooleanField(
        _('Volunteer Technical Community'),
        help_text=_('indicates membership of the Volunteer Technical Comunity'),
        default=False)

    social_twitter = models.CharField(
        _('Twitter Handle'),
        help_text=_("Provide your Twitter username, e.g. 'mapstory'."),
        max_length=255,
        null=True,
        blank=True)

    social_facebook = models.CharField(
        _('Facebook Profile'),
        help_text=_("Provide your Facebook username. From your profile page, this is what comes after 'facebook.com/' in the URL."),
        max_length=255,
        null=True,
        blank=True)

    social_github = models.CharField(_('GitHub Profile'),
                                     help_text=_("Provide your Github username, e.g. 'mapstory'."),
                                     max_length=255,
                                     null=True,
                                     blank=True)

    social_linkedin = models.CharField(
        _('LinkedIn Profile'),
        help_text=_("Provide your LinkedIn username. From your profile page, this is what comes after 'linkedin.com/in/' in the URL"),
        max_length=255,
        null=True,
        blank=True)

    education = models.TextField(
        _('Education'),
        null=True,
        blank=True,
        help_text=_('Provide some details about your Education and Background'))

    expertise = models.TextField(
        _('Expertise'),
        null=True,
        blank=True,
        help_text=_('Provide some details about your Expertise'))

    digest = models.BooleanField(
        _('Monthly email digest'),
        help_text=_('Subscribe to MapStory monthly email digest'),
        default=False)

    avatar_100 = models.CharField(
        max_length=512,
        blank=True,
        null=True)

    def interests_slug_list(self):
        return [kw.slug for kw in self.interests.all()]

def profile_post_save(instance, sender, **kwargs):
    MapstoryProfile.objects.filter(user_id=instance.id).update(
        avatar_100=avatar_url(instance, 100))

def avatar_post_save(instance, sender, **kw):
    MapstoryProfile.objects.filter(user_id=instance.user.id).update(
        avatar_100=avatar_url(instance.user, 100))

def create_mapstory_profile(sender, instance, created, **kwargs):
    if created:
        MapstoryProfile.objects.create(user=instance)

def save_mapstory_profile(sender, instance, **kwargs):
    instance.mapstoryprofile.save()

signals.post_save.connect(avatar_post_save, sender=Avatar)
signals.post_save.connect(profile_post_save, sender=Geonode_Profile)
signals.post_save.connect(create_mapstory_profile, sender=Geonode_Profile)
signals.post_save.connect(save_mapstory_profile, sender=Geonode_Profile)
