from tastypie.resources import ModelResource
from .models import Organization


class OrganizationResource(ModelResource):

    class Meta:
        queryset = Organization.objects.all()
        resource_name = 'organization'
        allowed_methods = ['get']

    def dehydrate(self, bundle):
        bundle.data['url'] = bundle.obj.get_absolute_url()
        bundle.data['members'] = bundle.obj.get_member_count()
        return bundle
