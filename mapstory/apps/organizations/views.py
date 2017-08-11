from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse

from .models import Organization, OrganizationMembership, OrganizationURL, OrganizationLayer, OrganizationMapStory


def organization_detail(request, pk):
    org = get_object_or_404(Organization, pk=pk)
    members = OrganizationMembership.objects.filter(organization=org)
    org_urls = OrganizationURL.objects.filter(org=org)
    org_layers = OrganizationLayer.objects.filter(organization=org)
    org_mapstories = OrganizationMapStory.objects.filter(organization=org)

    layers = []
    mapstories = []

    for l in org_layers:
        share_url = "https://%s/layers/%s" % (request.get_host(), l.layer.name)
        wrap = {
            'layer': l.layer,
            'url': share_url
        }
        layers.append(wrap)

    for m in org_mapstories:
        share_url = "https://%s/story/%s" % (request.get_host(), m.mapstory.id)
        wrap = {
            'mapstory': m.mapstory,
            'url': share_url
        }
        mapstories.append(wrap)

    context = {
        'org': org,
        'members': members,
        'urls': org_urls,
        'layers': layers,
        'mapstories': mapstories
    }

    return render(request, 'organizations/organization_detail.html', context)

def organization_list(request):
    context = {
        'organizations': Organization.objects.all(),
    }
    return render(request, 'organizations/organization_list.html', context)


def membership_detail(request, org_pk, membership_pk):
    org = get_object_or_404(OrganizationMembership, pk=membership_pk)
    context = {
        'membership': org,

    }
    return render(request, 'organizations/membership_detail.html', context)
