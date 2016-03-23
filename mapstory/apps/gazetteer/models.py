from django.db import models

# Create your models here.

class LocationType (models.Model):
    code = models.CharField(max_length=10, unique=True)
    label = models.CharField(max_length=200)
    definition = models.CharField(max_length=2000)   
    citation = models.URLField(null=True)
    def __unicode__(self):
        return ( self.code + ' = ' + self.label )

class Location(models.Model):
    defaultName = models.CharField(max_length=200)
    locationType = models.ForeignKey(LocationType, to_field='code')
    latitude = models.FloatField()
    longitude = models.FloatField()
    latMin = models.FloatField(blank=True,null=True)
    latMax = models.FloatField(blank=True,null=True)
    longMin = models.FloatField(blank=True,null=True)
    longMax = models.FloatField(blank=True,null=True)
    def __unicode__(self):
        return ( self.defaultName  )

class LocationName(models.Model):
    location = models.ForeignKey(Location)
    name = models.CharField(max_length=200)
    language = models.CharField(max_length=2,help_text='language code e.g. <em>en</em>', default='en')
    namespace = models.URLField(blank=True)
    nameValidStart = models.DateField(blank=True,null=True)
    nameValidEnd = models.DateField(blank=True,null=True)   
    def __unicode__(self):
        return ( self.name + '@' + self.language )
        
## todo - add a LocationRelation        
## todo - add citation from layer to a name

