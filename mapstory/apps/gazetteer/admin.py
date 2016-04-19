from django.contrib import admin
from mapstory.apps.gazetteer.models import LocationType,Location,LocationName

# Register your models here.

# works for Dango > 1.6 
class NameInline(admin.TabularInline):
    model = LocationName

class LocationAdmin(admin.ModelAdmin):
    inlines = [
        NameInline,
    ]

admin.site.register(LocationType);
admin.site.register(Location);
admin.site.register(LocationName);