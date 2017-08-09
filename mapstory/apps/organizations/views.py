from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse

from .models import Organization, OrganizationMembership, OrganizationURL, OrganizationLayer, OrganizationMapStory


def organization_detail(request, pk):
    org = get_object_or_404(Organization, pk=pk)
    members = OrganizationMembership.objects.filter(organization=org)
    org_urls = OrganizationURL.objects.filter(org=org)
    org_layers = OrganizationLayer.objects.filter(organization=org)
    org_mapstories = OrganizationMapStory.objects.filter(organization=org)

    context = {
        'org': org,
        'members': members,
        'urls': org_urls,
        'layers': org_layers,
        'mapstories': org_mapstories,
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
