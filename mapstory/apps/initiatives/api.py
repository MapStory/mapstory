from tastypie.resources import ModelResource
from .models import Initiative


class InitiativeResource(ModelResource):
    class Meta:
        queryset = Initiative.objects.all()
        resource_name = 'initiative'
