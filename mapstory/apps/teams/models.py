from django.db import models
from model_utils.managers import InheritanceManager


class Team(models.Model):
    """
    A Team.
    Has members. Functions an abastract base object for Organizations and Initiatives.
    """
    created_at = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)
    name = models.CharField(max_length=255)
    slogan = models.CharField(max_length=255, default='')
    about = models.TextField(default='')
    is_active = models.BooleanField(default=True)
    city = models.CharField(default='', max_length=255)
    country = models.CharField(default='', max_length=255)
    group_type = models.CharField(default='', max_length=255)
    # Holds all objects that Inherit from this class using model_utils
    # This is used for Polymorphic groups (Orgs and Initiatives)
    objects = InheritanceManager()

    class Meta:
        verbose_name_plural = 'Teams'
        verbose_name = 'Team'

    def __unicode__(self):
        return self.name
