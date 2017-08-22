from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse

from .models import Organization, OrganizationMembership, OrganizationURL, \
    OrganizationLayer, OrganizationMapStory

def organization_detail(request, pk):
    """Organization Detail View.
    Shows detailed information about an Organization.
    :param request: The http request.
    :param pk: The Organization's id.
    :return: A render view.
    """
    org = get_object_or_404(Organization, pk=pk)
    members = OrganizationMembership.objects.filter(organization=org)
    org_urls = OrganizationURL.objects.filter(org=org)
    org_layers = OrganizationLayer.objects.filter(organization=org)
    org_mapstories = OrganizationMapStory.objects.filter(organization=org)

    layers = []
    mapstories = []
    featured_stories = []
    featured_layers = []

    for l in org_layers:
        share_url = "https://%s/layers/%s" % (request.get_host(), l.layer.name)
        layers.append({
            'layer': l.layer,
            'url': share_url
        })
        if l.is_featured:
            featured_layers.append({
                'layer': l.layer,
                'url': share_url
            })

    for m in org_mapstories:
        share_url = "https://%s/story/%s" % (request.get_host(), m.mapstory.id)
        mapstories.append({
            'mapstory': m.mapstory,
            'url': share_url
        })
        if m.is_featured:
            featured_stories.append({
                'mapstory': m.mapstory,
                'url': share_url
            })

    context = {
        'org': org,
        'members': members,
        'urls': org_urls,
        'layers': layers,
        'mapstories': mapstories,
        'featured_stories': featured_stories,
        'featured_layers': featured_layers
    }

    return render(request, 'organizations/organization_detail.html', context)

def organization_list(request):
    """Organization List View.
    Shows a list of Organizations.
    :param request: The HTTP Request.
    :return: A render view.
    """
    context = {
        'organizations': Organization.objects.filter(is_active=True),
    }
    return render(request, 'organizations/organization_list.html', context)


def membership_detail(request, org_pk, membership_pk):
    """Membership Detail View.
    Shows a membership's details.
    :param request: The HTTP request.
    :param org_pk: The Organization's id.
    :param membership_pk: The OrganizationMembership's id.
    :return: A render view.
    """
    org = get_object_or_404(OrganizationMembership, pk=membership_pk)
    context = {
        'membership': org,
    }
    return render(request, 'organizations/membership_detail.html', context)

def add_layer(request, org_pk, layer_pk):
    if request.POST:
        # TODO: Handle form POST
        # TODO: Check user's permissions
        pass
    return render(request, 'organizations/confirm_add.html', {})

def add_mapstory(request, org_pk, mapstory_pk):
    if request.POST:
        # TODO: Handle form POST
        # TODO: Check user's permissions
        pass
    return render(request, 'organizations/confirm_add.html', {})

def add_membership(request, org_pk, user_pk):
    if request.POST:
        # TODO: Handle form POST
        # TODO: Check user's permissions
        pass
    return render(request, 'organizations/confirm_add.html', {})
