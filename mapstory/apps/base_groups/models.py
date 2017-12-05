from django.db import models
from model_utils.managers import InheritanceManager


class BaseGroup(models.Model):
    name = models.CharField(max_length=255)
    objects = InheritanceManager()

