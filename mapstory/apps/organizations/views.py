from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse

from .models import Organization, OrganizationMembership, OrganizationURL

# Create your views here.
def organization_detail(request, pk):
    org = get_object_or_404(Organization, pk=pk)
    members = OrganizationMembership.objects.filter(organization=org)
    org_urls = OrganizationURL.objects.filter(org=org)

    context = {
        'org': org,
        'members': members,
        'urls': org_urls
    }

    return render(request, 'organizations/organization_detail.html', context)

def organization_list(request):
    context = {
        'organizations': Organization.objects.all()
    }
    return render(request, 'organizations/organization_list.html', context)

def membership_detail(request, org_pk, membership_pk):
    context = {}
    return render(request, 'organizations/membership_detail.html', context)