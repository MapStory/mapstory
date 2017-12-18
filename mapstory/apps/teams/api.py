import re

from tastypie import fields
from tastypie.resources import ModelResource
from tastypie.constants import ALL

from django.db.models import Q

from mapstory.apps.organizations.models import Organization
from mapstory.apps.initiatives.models import Initiative
from mapstory.apps.organizations.api import OrganizationResource
from mapstory.apps.initiatives.api import InitiativeResource
from .models import Team


class TeamResource(ModelResource):
    class Meta:
        queryset = Team.objects.select_subclasses()
        resource_name = 'team'
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

        elif isinstance(bundle.obj, Initiative):
            # Associate an Initiative
            resource = InitiativeResource()
            bundle = resource.build_bundle(obj=bundle.obj, request=bundle.request)
            bundle.data = resource.full_dehydrate(bundle).data

        return bundle

    def build_filters(self, filters=None, ignore_bad_filters=False):
        if filters is None:
            filters = {}
        orm_filters = super(TeamResource, self).build_filters(filters)

        if 'city' in filters:
            query = filters['city']
            qset = (
                Q(city__icontains=query) |
                Q(country__icontains=query)
            )
            orm_filters.update({'city': qset})

        if 'group_type' in filters:
            query = filters['group_type']
            qset = (
                Q(group_type=query)
            )
            orm_filters.update({'group_type': qset})

        if 'q' in filters:
            q = filters['q']
            qset = (
                Q(name__icontains=q) |
                Q(slogan__icontains=q)
            )
            orm_filters.update({'qfilter': qset})

        return orm_filters

    def apply_filters(self, request, applicable_filters):
        if 'city' in applicable_filters:
            city = applicable_filters.pop('city')
        else:
            city = None

        if 'group_type' in applicable_filters:
            group_type = applicable_filters.pop('group_type')
        else:
            group_type = None

        if 'qfilter' in applicable_filters:
            qfilter = applicable_filters.pop('qfilter')
        else:
            qfilter = None

        # Apply the filters
        semi_filtered = super(TeamResource, self).apply_filters(request, applicable_filters)
        if city is not None:
            semi_filtered = semi_filtered.filter(city)
        if group_type is not None:
            semi_filtered = semi_filtered.filter(group_type)
        if qfilter is not None:
            semi_filtered = semi_filtered.filter(qfilter)

        return semi_filtered
