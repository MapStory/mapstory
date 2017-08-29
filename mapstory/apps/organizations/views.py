from django.contrib.auth.decorators import login_required
from django.shortcuts import render, get_object_or_404, redirect
from django.http import HttpResponse, HttpResponseForbidden
from django.core.urlresolvers import reverse
from django.contrib.auth import get_user_model

User = get_user_model()

from .models import Organization, OrganizationMembership, OrganizationURL, OrganizationLayer, OrganizationMapStory


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

    # Check membership
    membership = None
    memberships = OrganizationMembership.objects.filter(organization=org, user__pk=request.user.pk)
    if memberships.count() > 0:
        membership = memberships.first()

    for l in org_layers:
        share_url = "https://%s/layers/%s" % (request.get_host(), l.layer.name)
        layers.append({
            'layer': l.layer,
            'url': share_url,
            'is_featured': l.is_featured
        })


    for m in org_mapstories:
        share_url = "https://%s/story/%s" % (request.get_host(), m.mapstory.id)
        mapstories.append({
            'mapstory': m.mapstory,
            'url': share_url,
            'is_featured': m.is_featured,
        })


    context = {
        'org': org,
        'members': members,
        'urls': org_urls,
        'layers': layers,
        'mapstories': mapstories,
        'membership': membership
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

def add_layer(request, pk, layer_pk):
    if request.POST:
        # TODO: Handle form POST
        # TODO: Check user's permissions
        pass
    return render(request, 'organizations/confirm_add.html', {})

def add_mapstory(request, pk, mapstory_pk):
    if request.POST:
        # TODO: Handle form POST
        # TODO: Check user's permissions
        pass
    return render(request, 'organizations/confirm_add.html', {})

@login_required
def add_membership(request, pk, user_pk):
    # Check that we are admins
    organization = get_object_or_404(Organization, pk=pk)
    membership = get_object_or_404(OrganizationMembership, organization=organization, user=request.user)

    if not membership.is_admin:
        # User is NOT AUTHORIZED!
        return HttpResponseForbidden()

    if request.POST:
        # User is Authorized to add users to this organization
        user_to_add = get_object_or_404(User, pk=user_pk)
        membership = OrganizationMembership.objects.get_or_create(organization=organization, user=user_to_add)

        return redirect(
            reverse('organizations:member_detail', kwargs={
                'org_pk': organization.pk,
                'membership_pk':membership.pk}
            )
        )

    return redirect(request, reverse('organizations:manager', kwargs={'pk':pk}))


@login_required
def manager(request, pk):
    # Check that we are admins
    organization = get_object_or_404(Organization, pk=pk)
    membership = get_object_or_404(OrganizationMembership, organization=organization, user=request.user)

    if not membership.is_admin:
        # User is NOT AUTHORIZED!
        return HttpResponseForbidden()

    return render(request, 'organizations/manager.html', {'organization':organization})
