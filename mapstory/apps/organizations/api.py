from tastypie.constants import ALL
from tastypie.resources import ModelResource

from .models import Organization


class OrganizationResource(ModelResource):

    class Meta:
        queryset = Organization.objects.all()
        resource_name = 'organization'
        allowed_methods = ['get']
        filtering = {
            'name': ALL,
            'city': ALL,
            'country': ALL,
            'is_active': ALL,
        }

    def dehydrate(self, bundle):
        bundle.data['url'] = bundle.obj.get_absolute_url()
        bundle.data['members'] = bundle.obj.get_member_count()
        bundle.data['group_type'] = 'organization'
        return bundle
