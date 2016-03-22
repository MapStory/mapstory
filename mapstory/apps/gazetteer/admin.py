from django.contrib import admin
from mapstory.apps.gazetteer.models import LocationType,Location,LocationName

# Register your models here.



admin.site.register(LocationType);
admin.site.register(Location);
admin.site.register(LocationName);