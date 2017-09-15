from django.contrib.auth.decorators import login_required
from django.shortcuts import render, get_object_or_404, redirect
from django.http import HttpResponse, HttpResponseForbidden
from django.core.urlresolvers import reverse
from   django.contrib.auth import get_user_model

from .models import Organization, OrganizationMembership, OrganizationURL, OrganizationLayer, OrganizationMapStory, \
    OrganizationSocialMedia

from . import forms

User = get_user_model()

def organization_detail(request, pk):
    """Organization Detail View.
    Shows detailed information about an Organization.
    :param request: The http request.
    :param pk: The Organization's id.
    :return: A render view.
    """
    org = get_object_or_404(Organization, pk=pk)

    # Determine the type of HTTP request
    if request.method == "POST":
        # Handle form data
        if request.POST.get("request_remove_layer"):
            layer_pk = request.POST.get("layer_pk")
            found_layer = get_object_or_404(OrganizationLayer, organization=org, layer__pk=layer_pk)
            # TODO: Request admin to remove this layer

        elif request.POST.get("remove_layer"):
            layer_pk = request.POST.get("layer_pk")
            found_layer = get_object_or_404(OrganizationLayer, organization=org, layer__pk=layer_pk)
            found_layer.delete()
            #TODO: Send a Django Message to confirm


        elif request.POST.get("remove_featured_layer"):
            layer_pk = request.POST.get("layer_pk")
            found_layer = get_object_or_404(OrganizationLayer, organization=org, layer__pk=layer_pk)
            found_layer.is_featured = False
            found_layer.save()
            # TODO: Send a Django Message to confirm

        elif request.POST.get("remove_mapstory"):
            mapstory_pk = request.POST.get("mapstory_pk")
            found_mapstory = get_object_or_404(OrganizationMapStory, organization=org, mapstory__pk=mapstory_pk)
            found_mapstory.delete()

        elif request.POST.get("remove_featured_mapstory"):
            mapstory_pk = request.POST.get("mapstory_pk")
            found_mapstory = get_object_or_404(OrganizationMapStory, organization=org, mapstory__pk=mapstory_pk)
            found_mapstory.is_featured = False
            found_mapstory.save()

        elif request.POST.get("request_remove_mapstory"):
            mapstory_pk = request.POST.get("mapstory_pk")
            found_mapstory = get_object_or_404(OrganizationMapStory, organization=org, mapstory__pk=mapstory_pk)
            #TODO: Ask the admin to remove this


    members = OrganizationMembership.objects.filter(organization=org)
    org_urls = OrganizationURL.objects.filter(org=org)
    org_layers = OrganizationLayer.objects.filter(organization=org)
    org_mapstories = OrganizationMapStory.objects.filter(organization=org)
    org_social_media = OrganizationSocialMedia.objects.filter(organization=org)

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

    membership = OrganizationMembership.objects.get(user_id=request.user.pk, organization_id=pk)

    # TODO: Return a proper response
    if (not membership.is_admin) or (not membership.is_active):
        return HttpResponse("You are not allowed to do this.")

    if request.method == 'POST':
        # Check if not already added
        found = OrganizationLayer.objects.filter(organization_id=pk, layer_id=layer_pk)

        if found.count() > 0:
            # TODO: Return a proper error
            return HttpResponse("This layer has already been added to this Organization.")
        else:
            obj = OrganizationLayer()
            obj.organization_id = pk
            obj.layer_id = layer_pk
            obj.membership = membership
            obj.save()
            # TODO: Show a confirmation message

    return redirect(reverse("organizations:detail", kwargs={'pk':pk}))


def add_mapstory(request, pk, mapstory_pk):
    if request.method.POST:
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

def _edit_organization_with_forms(organization, basic, links):
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
    organization = get_object_or_404(Organization, pk=pk)
    membership = get_object_or_404(OrganizationMembership, organization=organization, user=request.user)
    if not membership.is_admin:
        # User is NOT AUTHORIZED!
        return HttpResponseForbidden()

    # Determine the type of HTTP request
    if request.method == 'POST':
        basic_info_form = forms.BasicInformation(request.POST)
        links_form = forms.LinksAndSocialMedia(request.POST)
        if basic_info_form.is_valid() and links_form.is_valid():
            _edit_organization_with_forms(organization, basic_info_form, links_form)

    else:
        # Load Form's initial data
        urls = OrganizationURL.objects.filter(org=organization)
        facebook = OrganizationSocialMedia.objects.filter(icon="fa-facebook", organization=organization)
        twitter = OrganizationSocialMedia.objects.filter(icon="fa-twitter", organization=organization)
        linkedin = OrganizationSocialMedia.objects.filter(icon="fa-linkedin", organization=organization)
        github = OrganizationSocialMedia.objects.filter(icon="fa-github", organization=organization)
        instragram = OrganizationSocialMedia.objects.filter(icon="fa-instragram", organization=organization)
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


        basic_info_form = forms.BasicInformation(initial=info)
        links_form = forms.LinksAndSocialMedia(initial=links)

    return render(request, 'organizations/manager.html', {
        'org':organization,
        'basic_form':basic_info_form,
        'links_form':links_form
    })
