from django.contrib.auth.decorators import login_required
from django.shortcuts import render, get_object_or_404, redirect
from django.http import HttpResponse, HttpResponseForbidden
from django.core.urlresolvers import reverse
from django.contrib.auth import get_user_model
from django.contrib import messages

from . import models
from . import forms

User = get_user_model()


def organization_detail(request, pk):
    """Organization Detail View.
    Shows detailed information about an Organization.
    :param request: The http request.
    :param pk: The Organization's id.
    :return: A render view.
    """
    org = get_object_or_404(models.Organization, pk=pk)

    # Determine the type of HTTP request
    if request.method == "POST":
        # Handle form data
        if request.POST.get("add_featured_layer"):
            layer_pk = request.POST.get("layer_pk")
            found_layer = get_object_or_404(models.OrganizationLayer, organization=org, layer__pk=layer_pk)
            found_layer.is_featured = True
            found_layer.save()
            messages.success(request, "Added Layer to Featured")

        elif request.POST.get("remove_layer"):
            layer_pk = request.POST.get("layer_pk")
            found_layer = get_object_or_404(models.OrganizationLayer, organization=org, layer__pk=layer_pk)
            found_layer.delete()
            messages.success(request, "Removed Layer from Organization")

        elif request.POST.get("remove_featured_layer"):
            layer_pk = request.POST.get("layer_pk")
            found_layer = get_object_or_404(models.OrganizationLayer, organization=org, layer__pk=layer_pk)
            found_layer.is_featured = False
            found_layer.save()
            messages.success(request, "Removed Layer from Featured")

        elif request.POST.get("remove_mapstory"):
            mapstory_pk = request.POST.get("mapstory_pk")
            found_mapstory = get_object_or_404(models.OrganizationMapStory, organization=org, mapstory__pk=mapstory_pk)
            found_mapstory.delete()
            messages.success(request, "Removed MapStory from Organization")

        elif request.POST.get("remove_featured_mapstory"):
            mapstory_pk = request.POST.get("mapstory_pk")
            found_mapstory = get_object_or_404(models.OrganizationMapStory, organization=org, mapstory__pk=mapstory_pk)
            found_mapstory.is_featured = False
            found_mapstory.save()
            messages.success(request, "Removed MapStory from Featured")

        elif request.POST.get("add_featured_mapstory"):
            mapstory_pk = request.POST.get("mapstory_pk")
            found_mapstory = get_object_or_404(models.OrganizationMapStory, organization=org, mapstory__pk=mapstory_pk)
            found_mapstory.is_featured = True
            found_mapstory.save()
            messages.success(request, "Added MapStory to Featured")

    members = models.OrganizationMembership.objects.filter(organization=org)
    org_urls = models.OrganizationURL.objects.filter(org=org)
    org_layers = models.OrganizationLayer.objects.filter(organization=org)
    org_mapstories = models.OrganizationMapStory.objects.filter(organization=org)
    org_social_media = models.OrganizationSocialMedia.objects.filter(organization=org)

    layers = []
    mapstories = []

    # Check membership
    membership = None
    memberships = models.OrganizationMembership.objects.filter(organization=org, user__pk=request.user.pk)
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
        'membership': membership,
        'social_icons': org_social_media,
    }

    return render(request, 'organizations/organization_detail.html', context)


def organization_list(request):
    """Organization List View.
    Shows a list of Organizations.
    :param request: The HTTP Request.
    :return: A render view.
    """
    context = {
        'organizations': models.Organization.objects.filter(is_active=True),
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
    org = get_object_or_404(models.OrganizationMembership, pk=membership_pk)
    context = {
        'membership': org,
    }
    return render(request, 'organizations/membership_detail.html', context)


def add_layer(request, pk, layer_pk):
    """
    Adds a layer to an Organization.
    :param request: HTTP request.
    :param pk: The Organization id.
    :param layer_pk: The Layer id.
    :return: An HTTPResponse
    """
    membership = get_object_or_404(models.OrganizationMembership, user_id=request.user.pk, organization_id=pk)

    if (not membership.is_admin) or (not membership.is_active):
        messages.error(request, "You are not allowed to do this.")
        return redirect(reverse("organizations:detail", kwargs={'pk':pk}))

    if request.method == 'POST':
        # Check if not already added
        found = models.OrganizationLayer.objects.filter(organization_id=pk, layer_id=layer_pk)

        if found.count() > 0:
            # Duplicate Layer
            messages.warning(request, "This layer has already been added to this Organization.")
        else:
            # Add the Layer
            obj = models.OrganizationLayer()
            obj.organization_id = pk
            obj.layer_id = layer_pk
            obj.membership = membership
            obj.save()
            messages.success(request, "Added Layer to Organization")

    return redirect(reverse("organizations:detail", kwargs={'pk':pk}))


def add_mapstory(request, pk, mapstory_pk):
    """
    Adds a Mapstory to an Organization.
    :param request: HTTPRequest
    :param pk: Organizaion id
    :param mapstory_pk: Mapstory id
    :return: HTTPResponse
    """
    membership = get_object_or_404(
        models.OrganizationMembership,
        user_id=request.user.pk,
        organization_id=pk
    )

    # Make sure we have permissions to do this
    if (not membership.is_admin) or (not membership.is_active):
        messages.error(request, "You are not allowed to do this.")
        return redirect(reverse("organizations:detail", kwargs={'pk': pk}))

    if request.method == 'POST':
        # Check if not already added
        found = models.OrganizationMapStory.objects.filter(organization_id=pk, mapstory_id=mapstory_pk)

        if found.count() > 0:
            # Give a warning to the user
            messages.warning(request, "This Mapstory has already been added to this Organization.")
        else:
            # Add it to the Organization
            obj = models.OrganizationMapStory()
            obj.organization_id = pk
            obj.mapstory_id = mapstory_pk
            obj.membership = membership
            obj.save()
            messages.success(request, "Added MapStory to Organization")

    return redirect(reverse("organizations:detail", kwargs={'pk': pk}))


@login_required
def add_membership(request, pk, user_pk):
    """
    Creates a new membership.
    :param request: HttpRequest.
    :param pk: The organization's id.
    :param user_pk: The user's id.
    :return: HTTPResponse
    """
    # Check that we are admins
    organization = get_object_or_404(models.Organization, pk=pk)
    membership = get_object_or_404(models.OrganizationMembership, organization=organization, user=request.user)

    if not membership.is_admin:
        # User is NOT AUTHORIZED!
        return HttpResponseForbidden()

    if request.POST:
        # User is Authorized to add users to this organization
        user_to_add = get_object_or_404(User, pk=user_pk)
        membership = models.OrganizationMembership.objects.get_or_create(organization=organization, user=user_to_add)

        return redirect(
            reverse('organizations:member_detail', kwargs={
                'org_pk': organization.pk,
                'membership_pk':membership.pk}
            )
        )

    return redirect(reverse('organizations:manage', kwargs={'pk':pk}))


def _edit_organization_with_forms(organization, basic, links):
    """
    Helper function for for setting an organization's data from forms.
    :param organization: The organization
    :param basic: The Basic information form
    :param links: The Links form
    :return:
    """
    # TODO: Use this solution: https://stackoverflow.com/questions/1355150/django-when-saving-how-can-you-check-if-a-field-has-changed/1793323#1793323
    organization.title = basic.cleaned_data['name']
    organization.about = basic.cleaned_data['about']
    organization.city = basic.cleaned_data['city']
    organization.slogan = basic.cleaned_data['slogan']
    organization.country = basic.cleaned_data['country']
    organization.image = basic.cleaned_data['image']
    organization.save()

    # TODO: Handle Links


@login_required
def manager(request, pk):
    """
    Organization Manager Page.
    Page for managing all settings for the Organization.

    :param request: HTTP Request.
    :param pk: The Organizations id
    :return: An HTTPResponse
    """
    # Check that we are admins
    organization = get_object_or_404(models.Organization, pk=pk)
    membership = get_object_or_404(models.OrganizationMembership, organization=organization, user=request.user)
    if not membership.is_admin:
        # User is NOT AUTHORIZED!
        return HttpResponse("You are not authorized!")

    # GET:
    # Load Form's initial data
    urls = models.OrganizationURL.objects.filter(org=organization)
    facebook = models.OrganizationSocialMedia.objects.filter(icon="fa-facebook", organization=organization)
    twitter = models.OrganizationSocialMedia.objects.filter(icon="fa-twitter", organization=organization)
    linkedin = models.OrganizationSocialMedia.objects.filter(icon="fa-linkedin", organization=organization)
    github = models.OrganizationSocialMedia.objects.filter(icon="fa-github", organization=organization)
    instragram = models.OrganizationSocialMedia.objects.filter(icon="fa-instragram", organization=organization)
    join_requests = models.JoinRequest.objects.filter(organization=organization, is_open=True)
    memberships = models.OrganizationMembership.objects.filter(organization=organization)
    info = {
        'name': organization.title,
        'slogan': organization.slogan,
        'about': organization.about,
        'country': organization.country,
        'city': organization.city,
        'image': organization.image,
    }
    links = {
        'url0': urls.first() or "",
        'url1': urls[1] or "",
        'url2': urls[2] or "",
        'facebook': facebook.first().url if facebook.first() else "",
        'twitter': twitter.first().url if twitter.first() else "",
        'linkedin': linkedin.first().url if linkedin.first() else "",
        'github': github.first().url if github.first() else "",
        'instagram': instragram.first().url if instragram.first() else "",
    }

    # Determine the type of HTTP request
    if request.method == 'POST':
        basic_info_form = forms.BasicInformation(request.POST)
        links_form = forms.LinksAndSocialMedia(request.POST)
        if basic_info_form.is_valid() and links_form.is_valid():
            _edit_organization_with_forms(organization, basic_info_form, links_form)

    # Set the forms initial data
    basic_info_form = forms.BasicInformation(initial=info)
    links_form = forms.LinksAndSocialMedia(initial=links)

    return render(request, 'organizations/manager.html', {
        'org':organization,
        'basic_form':basic_info_form,
        'links_form':links_form,
        'join_requests': join_requests,
        'memberships': memberships,
    })


def request_membership(request, pk):
    if not request.user.is_authenticated():
        messages.warning(request, 'Please Log In or Sign Up before joining an Organization.')
        return redirect(reverse("index_view"))

    # Make sure the Request doesnt exist yet.
    found = models.JoinRequest.objects.filter(organization_id = pk, user=request.user.pk)
    if found.count() > 0:
        messages.warning(request, 'A request to join has already been made.')
        return redirect(reverse("organizations:detail", kwargs={'pk': pk}))

    if request.method == 'POST':
        # Generate a new JoinRequest
        request_to_join = models.JoinRequest()
        request_to_join.user_id = request.user.pk
        request_to_join.is_open = True
        request_to_join.organization_id = pk
        request_to_join.save()
        messages.success(request, 'A request to join has been made')

    return redirect(reverse("organizations:detail", kwargs={'pk':pk}))


def approve_membership(request, pk):
    if not request.user.is_authenticated():
        messages.warning(request, "You are not logged in.")
        return redirect(reverse("index_view"))

    if request.method == 'POST':
        # Make sure that we have permission
        admin_membership = get_object_or_404(models.OrganizationMembership, organization_id = pk, user_id = request.user.pk)
        if not admin_membership.is_admin:
            messages.warning(request, "You do not have permissions to do this.")
            return redirect(reverse("organizations:detail", kwargs={'pk': pk}))
        else:
            request_pk = request.POST.get("request_pk")
            join_request = get_object_or_404(models.JoinRequest, pk=request_pk)
            approval = request.POST.get("approval")

            if approval == 'accept':
                new_membership = join_request.approve(admin_membership)
                messages.success(request, "New member added to Organization.")
            elif approval == 'decline':
                join_request.decline(admin_membership)
                messages.success(request,"Request to join declined.")

    return redirect(reverse('organizations:manage', kwargs={'pk': pk}))
