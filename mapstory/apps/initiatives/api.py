from tastypie.constants import ALL
from tastypie.resources import ModelResource

from .models import Initiative


class InitiativeResource(ModelResource):
    class Meta:
        queryset = Initiative.objects.all()
        resource_name = 'initiative'
        allowed_methods = ['get']

        filtering = {
            'title': ALL,
            'city': ALL,
            'country': ALL,
            'is_active': ALL,
        }

    def dehydrate(self, bundle):
        bundle.data['url'] = bundle.obj.get_absolute_url()
        bundle.data['members'] = bundle.obj.get_member_count()
        return bundle
