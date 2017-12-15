import re

from django.db.models import Q

from tastypie.resources import ModelResource
from tastypie.constants import ALL

from mapstory.apps.organizations.models import Organization
from mapstory.apps.initiatives.models import Initiative
from mapstory.apps.organizations.api import OrganizationResource
from mapstory.apps.initiatives.api import InitiativeResource

from .models import BaseGroup


class BaseGroupResource(ModelResource):
    class Meta:
        queryset = BaseGroup.objects.select_subclasses()
        resource_name = 'group'
        filtering = {
            'name': ALL,
            'slogan': ALL,
            'is_active': ALL,
            'city': ALL,
            'country': ALL,
            'group_type': ALL
        }

    def dehydrate(self, bundle):
        # Runtime Polymorphism!!!
        if isinstance(bundle.obj, Organization):
            # Associate an Organization
            resource = OrganizationResource()
            bundle = resource.build_bundle(obj=bundle.obj, request=bundle.request)
            bundle.data = resource.full_dehydrate(bundle).data
            bundle.data['group_type'] = 'organization'

        elif isinstance(bundle.obj, Initiative):
            # Associate an Initiative
            resource = InitiativeResource()
            bundle = resource.build_bundle(obj=bundle.obj, request=bundle.request)
            bundle.data = resource.full_dehydrate(bundle).data
            bundle.data['group_type'] = 'initiative'

        return bundle

    def build_filters(self, filters=None, ignore_bad_filters=False):
        if filters is None:
            filters = {}
        orm_filters = super(BaseGroupResource, self).build_filters(filters)

        if 'q' in filters:
            q = filters['q']
            qset = (
                Q(name__icontains=q) |
                Q(slogan__icontains=q)
            )
            orm_filters.update({'qfilter': qset})

        return orm_filters

    def apply_filters(self, request, applicable_filters):
        if 'qfilter' in applicable_filters:
            qfilter = applicable_filters.pop('qfilter')
        else:
            qfilter = None

        semi_filtered = super(BaseGroupResource, self).apply_filters(request, applicable_filters)

        return semi_filtered.filter(qfilter) if qfilter else semi_filtered
