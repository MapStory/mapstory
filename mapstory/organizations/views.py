from django.contrib.auth.decorators import login_required
from django.shortcuts import render, get_object_or_404, redirect
from django.http import HttpResponse, HttpResponseForbidden
from django.core.urlresolvers import reverse
from django.contrib.auth import get_user_model
from django.contrib import messages

from . import models
from . import forms

User = get_user_model()


def organization_detail(request, slug):
    """Organization Detail View.
    Shows detailed information about an Organization.
    :param request: The http request.
    :param slug: The Organization's slug.
    :return: A render view.
    """
    org = get_object_or_404(models.Organization, slug=slug)

    # Determine the type of HTTP request
    if request.POST:
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
    org_layers = models.OrganizationLayer.objects.filter(organization=org)
    org_mapstories = models.OrganizationMapStory.objects.filter(organization=org)

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

    social_icons = []
    if org.facebook:
        social_icons.append(models.OrganizationSocialMedia.objects.get(pk=org.facebook.pk))
    if org.twitter:
        social_icons.append(models.OrganizationSocialMedia.objects.get(pk=org.twitter.pk))
    if org.instagram:
        social_icons.append(models.OrganizationSocialMedia.objects.get(pk=org.instagram.pk))
    if org.linkedin:
        social_icons.append(models.OrganizationSocialMedia.objects.get(pk=org.linkedin.pk))
    if org.github:
        social_icons.append(models.OrganizationSocialMedia.objects.get(pk=org.github.pk))

    org_urls = []

    if org.url0:
        org_urls.append(models.OrganizationURL.objects.get(pk=org.url0.pk))

    if org.url1:
        org_urls.append(models.OrganizationURL.objects.get(pk=org.url1.pk))

    if org.url2:
        org_urls.append(models.OrganizationURL.objects.get(pk=org.url2.pk))

    context = {
        'org': org,
        'members': members,
        'urls': org_urls,
        'layers': layers,
        'mapstories': mapstories,
        'membership': membership,
        'org_image': org.image,
        'social_icons': social_icons,
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


@login_required
def add_layer(request, slug, layer_pk):
    """
    Adds a layer to an Organization.
    :param request: HTTP request.
    :param slug: The Organization slug.
    :param layer_pk: The Layer id.
    :return: An HTTPResponse
    """
    org = get_object_or_404(models.Organization, slug=slug)
    membership = get_object_or_404(models.OrganizationMembership, user_id=request.user.pk, organization=org)

    if membership.is_admin or membership.is_active:
        pass
    else:
        messages.error(request, "You are not allowed to do this.")
        return redirect(reverse("organizations:detail", kwargs={'slug': slug}))

    if request.POST:
        # Check if not already added
        org = get_object_or_404(models.Organization, slug=slug)
        found = models.OrganizationLayer.objects.filter(organization=org, layer_id=layer_pk)

        if found.count() > 0:
            # Duplicate Layer
            messages.warning(request, "This layer has already been added to this Organization.")
        else:
            # Add the Layer
            obj = models.OrganizationLayer()
            obj.organization = org
            obj.layer_id = layer_pk
            obj.membership = membership
            obj.save()
            messages.success(request, "Added Layer to Organization")

    return redirect(reverse("organizations:detail", kwargs={'slug': slug}))


def add_mapstory(request, slug, mapstory_pk):
    """
    Adds a Mapstory to an Organization.
    :param request: HTTPRequest
    :param slug: The Organization's slug.
    :param mapstory_pk: Mapstory id
    :return: HTTPResponse
    """
    org = get_object_or_404(models.Organization, slug=slug)
    membership = get_object_or_404(
        models.OrganizationMembership,
        user__pk=request.user.pk,
        organization=org,
    )

    # Make sure we have permissions to do this
    if membership.is_admin or membership.is_active:
        pass
    else:
        messages.error(request, "You are not allowed to do this.")
        return redirect(reverse("organizations:detail", kwargs={'slug': slug}))

    if request.POST:
        # Check if not already added
        found = models.OrganizationMapStory.objects.filter(organization=org, mapstory__pk=mapstory_pk)

        if found.count() > 0:
            # Give a warning to the user
            messages.warning(request, "This Mapstory has already been added to this Organization.")
        else:
            # Add it to the Organization
            obj = models.OrganizationMapStory()
            obj.organization = org
            obj.mapstory_id = mapstory_pk
            obj.membership = membership
            obj.save()
            messages.success(request, "Added MapStory to Organization")

    return redirect(reverse("organizations:detail", kwargs={'slug': slug}))


def _save_social_icons(organization, facebook, twitter, instagram, linkedin, github):
    """
    Saves the social media urls for an Organization.
    :param organization: The Organization
    :param facebook: URL for facebook
    :param twitter: URL for twitter
    :param instagram: URL for instagram
    :param linkedin: URL for linkedin
    :param github: URL for github
    :return:
    """
    if facebook:
        if not organization.facebook:
            organization.facebook = models.OrganizationSocialMedia.objects.create(
                name="facebook",
                icon="fa-facebook",
                url=facebook
            )
        else:
            organization.facebook.url = facebook
            organization.facebook.save()

    if twitter:
        if not organization.twitter:
            organization.twitter = models.OrganizationSocialMedia.objects.create(
                name="twitter",
                icon="fa-twitter",
                url=twitter
            )
        else:
            organization.twitter.url = twitter
            organization.twitter.save()

    if instagram:
        if not organization.instagram:
            organization.instagram = models.OrganizationSocialMedia.objects.create(
                name="instagram",
                icon="fa-instagram",
                url=instagram
            )
        else:
            organization.instagram.url = instagram
            organization.instagram.save()

    if linkedin:
        if not organization.linkedin:
            organization.linkedin = models.OrganizationSocialMedia.objects.create(
                name="linkedin",
                icon="fa-linkedin",
                url=linkedin
            )
        else:
            organization.linkedin.url = linkedin
            organization.linkedin.save()

    if github:
        if not organization.github:
            organization.github = models.OrganizationSocialMedia.objects.create(
                name="github",
                icon="fa-github",
                url=github
            )
        else:
            organization.github.url = github
            organization.github.save()

    # Save the changes
    organization.save()


def _edit_organization_with_forms(organization, basic, links):
    """
    Helper function for for setting an organization's data from forms.
    :param organization: The organization
    :param basic: The Basic information form
    :param links: The Links form
    :return:
    """
    # TODO: Use this solution:
    # https://stackoverflow.com/questions/1355150/django-when-saving-how-can-you-check-if-a-field-has-changed/1793323#1793323
    organization.name = basic.cleaned_data['name']
    organization.about = basic.cleaned_data['about']
    organization.city = basic.cleaned_data['city']
    organization.slogan = basic.cleaned_data['slogan']
    organization.country = basic.cleaned_data['country']
    organization.image = basic.cleaned_data['image']

    if links.cleaned_data['url0']:
        if organization.url0:
            organization.url0.url = links.cleaned_data['url0']
            organization.url0.save()
        else:
            organization.url0 = models.OrganizationURL.objects.create(
                url=links.cleaned_data['url0']
            )

    if links.cleaned_data['url1']:
        if organization.url1:
            organization.url1.url = links.cleaned_data['url1']
        else:
            organization.url1 = models.OrganizationURL.objects.create(
                url=links.cleaned_data['url1']
            )

    if links.cleaned_data['url2']:
        if organization.url2:
            organization.url2.url = links.cleaned_data['url2']
        else:
            organization.url2 = models.OrganizationURL.objects.create(
                url=links.cleaned_data['url2']
            )

    organization.save()

    # Save the social medias:
    _save_social_icons(
        organization,
        facebook=links.cleaned_data['facebook'],
        instagram=links.cleaned_data['instagram'],
        twitter=links.cleaned_data['twitter'],
        linkedin=links.cleaned_data['linkedin'],
        github=links.cleaned_data['github'],
    )


@login_required
def manager(request, slug):
    """
    Organization Manager View.
    Page for managing all settings for the Organization.

    :param request: HTTP Request.
    :param slug: The Organization's slug.
    :return: An HTTPResponse
    """
    # Check that we are admins
    organization = get_object_or_404(models.Organization, slug=slug)
    membership = get_object_or_404(models.OrganizationMembership, organization=organization, user=request.user)
    if not membership.is_admin:
        # User is NOT AUTHORIZED!
        # TODO: Send the user somewhere else
        return HttpResponse("You are not authorized!")

    # GET:
    # Load Form's initial data
    # TODO: FIX THIS FOR SOCIAL MEDIA
    facebook = organization.facebook
    twitter = organization.twitter
    linkedin = organization.linkedin
    github = organization.github
    instagram = organization.instagram
    join_requests = models.JoinRequest.objects.filter(organization=organization, is_open=True)
    memberships = models.OrganizationMembership.objects.filter(organization=organization)
    org_image = organization.image
    info = {
        'name': organization.name,
        'slogan': organization.slogan,
        'about': organization.about,
        'country': organization.country,
        'city': organization.city,
        'image': organization.image,
    }

    links = {
        'url0': organization.url0,
        'url1': organization.url1,
        'url2': organization.url2,
        'facebook': facebook.url if facebook else "",
        'twitter': twitter.url if twitter else "",
        'linkedin': linkedin.url if linkedin else "",
        'github': github.url if github else "",
        'instagram': instagram.url if instagram else "",
    }

    # Determine the type of HTTP request
    if request.POST:
        # Get POST data
        basic_info_form = forms.BasicInformation(request.POST, request.FILES)
        links_form = forms.LinksAndSocialMedia(request.POST)

        # Check for valid forms
        if basic_info_form.is_valid() and links_form.is_valid():
            # All forms are valid
            _edit_organization_with_forms(organization, basic_info_form, links_form)

            messages.success(request, "Saved changes to Organization.")

            return redirect(reverse("organizations:detail", kwargs={'slug': slug}))
        else:
            # Information was not good
            messages.warning(request, "Info was not valid")

    # Set the forms initial data
    basic_info_form = forms.BasicInformation(initial=info)
    links_form = forms.LinksAndSocialMedia(initial=links)

    return render(request, 'organizations/manager.html', {
        'org': organization,
        'basic_form': basic_info_form,
        'links_form': links_form,
        'join_requests': join_requests,
        'memberships': memberships,
        'org_image': org_image,
    })


def request_membership(request, slug):
    """
    Creates a JoinRequest for the organization, provides the user
    with a message and redirects to the Organization's detail page.
    :param request: HTTPRequest
    :param slug: The organization's slug
    :return: HTTPResponse
    """
    if not request.user.is_authenticated():
        # TODO: Show the login popup.
        messages.warning(request, 'Please Log In or Sign Up before joining an Organization.')
        return redirect(reverse("index_view"))

    # Make sure the Request doesnt exist yet.
    org = get_object_or_404(models.Organization, slug=slug)
    found = models.JoinRequest.objects.filter(organization=org, user=request.user.pk)
    if found.count() > 0:
        messages.warning(request, 'A request to join has already been made.')
        return redirect(reverse("organizations:detail", kwargs={'slug': slug}))

    if request.POST:
        # Generate a new JoinRequest
        request_to_join = models.JoinRequest()
        request_to_join.user_id = request.user.pk
        request_to_join.is_open = True
        request_to_join.organization = get_object_or_404(models.Organization, slug=slug)
        request_to_join.save()
        messages.success(request, 'A request to join has been made')

    return redirect(reverse("organizations:detail", kwargs={'slug': slug}))


def approve_membership(request, slug):
    """
    Approves a request for membership
    :param request: HTTP Request
    :param slug: The Organization's slug.
    :return: A new membership if success.
    """
    if not request.user.is_authenticated():
        messages.warning(request, "You are not logged in.")
        return redirect(reverse("index_view"))

    if request.POST:
        # Make sure that we have permission
        admin_membership = get_object_or_404(
            models.OrganizationMembership,
            organization=get_object_or_404(models.Organization, slug=slug),
            user_id=request.user.pk
        )

        if not admin_membership.is_admin:
            # No permission
            messages.warning(request, "You do not have permissions to do this.")
            return redirect(reverse("organizations:detail", kwargs={'slug': slug}))
        else:
            # We have permission, continue
            request_pk = request.POST.get("request_pk")
            join_request = get_object_or_404(models.JoinRequest, pk=request_pk)
            approval = request.POST.get("approval")

            # Approve Request to join
            if approval == 'accept':
                new_membership = join_request.approve(admin_membership)
                messages.success(request, "New member added to Organization.")

            # Decline Request to join
            elif approval == 'decline':
                join_request.decline(admin_membership)
                messages.success(request, "Request to join declined.")

    return redirect(reverse('organizations:manage', kwargs={'slug': slug}))
