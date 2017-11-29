from tastypie.resources import ModelResource
from .models import Organization


class OrganizationResource(ModelResource):
    class Meta:
        queryset = Organization.objects.all()
        resource_name = 'organization'
        allowed_methods = ['get']
