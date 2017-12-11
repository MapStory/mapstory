from tastypie.resources import ModelResource
from tastypie.constants import ALL
from .models import BaseGroup
from mapstory.apps.organizations.models import Organization
from mapstory.apps.initiatives.models import Initiative
from mapstory.apps.organizations.api import OrganizationResource
from mapstory.apps.initiatives.api import InitiativeResource


class BaseGroupResource(ModelResource):
    class Meta:
        queryset = BaseGroup.objects.select_subclasses()
        resource_name = 'group'
        filtering = {
            'name': ALL,
            'group_type': ALL
        }

    def dehydrate(self, bundle):
        # Runtime Polymorphism!!!
        if isinstance(bundle.obj, Organization):
            resource = OrganizationResource()
            bundle = resource.build_bundle(obj=bundle.obj, request=bundle.request)
            bundle.data = resource.full_dehydrate(bundle).data
            bundle.data['group_type'] = 'organization'
        elif isinstance(bundle.obj, Initiative):
            resource = InitiativeResource()
            bundle = resource.build_bundle(obj=bundle.obj, request=bundle.request)
            bundle.data = resource.full_dehydrate(bundle).data
            bundle.data['group_type'] = 'initiative'
        return bundle
