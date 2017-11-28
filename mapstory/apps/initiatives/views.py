from django.contrib.auth.decorators import login_required
from django.shortcuts import render, get_object_or_404, redirect
from django.core.exceptions import SuspiciousOperation
from django.core.urlresolvers import reverse
from django.contrib import messages
from django.http import HttpResponse, HttpResponseForbidden, HttpResponseNotAllowed


from . import models
from . import forms


def initiatives_list(request):
    initiatives = models.Initiative.objects.all()
    return render(request, 'initiatives/list.html', context={
        'initiatives': initiatives
    })


def initiative_detail(request, slug):
    """
    Initiative Detail View.
    Shows detailed information about an Initiative.
    :param request: The http request.
    :param slug: The Initiative's slug.
    :return: A render view.
    """
    ini = get_object_or_404(models.Initiative, slug=slug)

    # Determine the type of HTTP request
    if request.POST:
        # Handle form data
        if request.POST.get("add_featured_layer"):
            layer_pk = request.POST.get("layer_pk")
            found_layer = get_object_or_404(models.InitiativeLayer, initiative=ini, layer__pk=layer_pk)
            found_layer.is_featured = True
            found_layer.save()
            messages.success(request, "Added Layer to Featured")

        elif request.POST.get("remove_layer"):
            layer_pk = request.POST.get("layer_pk")
            found_layer = get_object_or_404(models.InitiativeLayer, initiative=ini, layer__pk=layer_pk)
            found_layer.delete()
            messages.success(request, "Removed Layer from Initiative")

        elif request.POST.get("remove_featured_layer"):
            layer_pk = request.POST.get("layer_pk")
            found_layer = get_object_or_404(models.InitiativeLayer, initiative=ini, layer__pk=layer_pk)
            found_layer.is_featured = False
            found_layer.save()
            messages.success(request, "Removed Layer from Featured")

        elif request.POST.get("remove_mapstory"):
            mapstory_pk = request.POST.get("mapstory_pk")
            found_mapstory = get_object_or_404(models.InitiativeMapStory, initiative=ini, mapstory__pk=mapstory_pk)
            found_mapstory.delete()
            messages.success(request, "Removed MapStory from Initiative")

        elif request.POST.get("remove_featured_mapstory"):
            mapstory_pk = request.POST.get("mapstory_pk")
            found_mapstory = get_object_or_404(models.InitiativeMapStory, initiative=ini, mapstory__pk=mapstory_pk)
            found_mapstory.is_featured = False
            found_mapstory.save()
            messages.success(request, "Removed MapStory from Featured")

        elif request.POST.get("add_featured_mapstory"):
            mapstory_pk = request.POST.get("mapstory_pk")
            found_mapstory = get_object_or_404(models.InitiativeMapStory, initiative=ini, mapstory__pk=mapstory_pk)
            found_mapstory.is_featured = True
            found_mapstory.save()
            messages.success(request, "Added MapStory to Featured")

    members = models.InitiativeMembership.objects.filter(initiative=ini)
    ini_layers = models.InitiativeLayer.objects.filter(initiative=ini)
    ini_mapstories = models.InitiativeMapStory.objects.filter(initiative=ini)

    layers = []
    mapstories = []

    # Check membership
    membership = None
    memberships = models.InitiativeMembership.objects.filter(initiative=ini, user__pk=request.user.pk)
    if memberships.count() > 0:
        membership = memberships.first()

    for l in ini_layers:
        share_url = "https://%s/layers/%s" % (request.get_host(), l.layer.name)
        layers.append({
            'layer': l.layer,
            'url': share_url,
            'is_featured': l.is_featured
        })

    for m in ini_mapstories:
        share_url = "https://%s/story/%s" % (request.get_host(), m.mapstory.id)
        mapstories.append({
            'mapstory': m.mapstory,
            'url': share_url,
            'is_featured': m.is_featured,
        })

    context = {
        'ini': ini,
        'members': members,
        'layers': layers,
        'mapstories': mapstories,
        'membership': membership,
        'ini_image': ini.image,
    }
    return render(request, 'initiatives/detail.html', context=context)


@login_required
def request_membership(request, slug):
    """
    Creates a JoinRequest for the initiative, provides the user
    with a message and redirects to the initiative's detail page.
    :param request: HTTPRequest
    :param slug: The initiative's slug
    :return: HTTPResponse
    """
    if not request.user.is_authenticated():
        messages.warning(request, 'Please Log In or Sign Up before joining an initiative.')
        return redirect(reverse("index_view"))

    # Make sure the Request doesnt exist yet.
    ini = get_object_or_404(models.Initiative, slug=slug)
    found = models.JoinRequest.objects.filter(initiative=ini, user=request.user.pk)
    if found.count() > 0:
        messages.warning(request, 'A request to join has already been made.')
        return redirect(reverse("initiatives:detail", kwargs={'slug': slug}))

    if request.POST:
        # Generate a new JoinRequest
        request_to_join = models.JoinRequest()
        request_to_join.user_id = request.user.pk
        request_to_join.is_open = True
        request_to_join.initiative = get_object_or_404(models.Initiative, slug=slug)
        request_to_join.save()
        messages.success(request, 'A request to join has been made')

    return redirect(reverse("initiatives:detail", kwargs={'slug': slug}))


def _edit_initiative_with_forms(initiative, basic):
    """
    Helper function for for setting an initiatives's data from forms.
    :param initiative: The initiative
    :param basic: The Basic information form
    :return:
    """
    initiative.name = basic.cleaned_data['name']
    initiative.about = basic.cleaned_data['about']
    initiative.city = basic.cleaned_data['city']
    initiative.slogan = basic.cleaned_data['slogan']
    initiative.country = basic.cleaned_data['country']
    initiative.image = basic.cleaned_data['image']
    initiative.save()


@login_required
def manager(request, slug):
    """
    Initiative Manager View.
    Page for managing all settings for the Initiative.

    :param request: HTTP Request.
    :param slug: The Initiative's slug.
    :return: An HTTPResponse
    """
    # Check that we are admins
    initiative = get_object_or_404(models.Initiative, slug=slug)
    membership = get_object_or_404(models.InitiativeMembership, initiative=initiative, user=request.user)
    if not membership.is_admin:
        # User is NOT AUTHORIZED!
        # TODO: Send the user somewhere else
        return HttpResponseNotAllowed("Not authorized")

    join_requests = models.JoinRequest.objects.filter(initiative=initiative, is_open=True)
    memberships = models.InitiativeMembership.objects.filter(initiative=initiative)
    info = {
        'name': initiative.name,
        'slogan': initiative.slogan,
        'about': initiative.about,
        'country': initiative.country,
        'city': initiative.city,
        'image': initiative.image,
    }

    # Determine the type of HTTP request
    if request.POST:
        # Get POST data
        basic_info_form = forms.BasicInformation(request.POST, request.FILES)

        # Check for valid forms
        if basic_info_form.is_valid():
            # All forms are valid
            _edit_initiative_with_forms(initiative, basic_info_form)

            messages.success(request, "Saved changes to Initiative.")

            return redirect(reverse("initiatives:detail", kwargs={'slug': slug}))
        else:
            # Information was not good
            messages.warning(request, "Info was not valid")

    # Set the forms initial data
    basic_info_form = forms.BasicInformation(initial=info)

    return render(request, 'initiatives/manager.html', {
        'ini': initiative,
        'basic_form': basic_info_form,
        'join_requests': join_requests,
        'memberships': memberships,
        'ini_image': initiative.image,
    })


@login_required
def add_layer(request, slug, layer_pk):
    """
    Adds a layer to an Initiative.
    :param request: HTTP request.
    :param slug: The Initiative slug.
    :param layer_pk: The Layer id.
    :return: An HTTPResponse
    """
    ini = get_object_or_404(models.Initiative, slug=slug)
    membership = get_object_or_404(models.InitiativeMembership, user_id=request.user.pk, initiative=ini)

    if membership.is_admin or membership.is_active:
        pass
    else:
        messages.error(request, "You are not allowed to do this.")
        return redirect(reverse("initiatives:detail", kwargs={'slug': slug}))

    if request.POST:
        # Check if not already added
        ini = get_object_or_404(models.Initiative, slug=slug)
        found = models.InitiativeLayer.objects.filter(initiative=ini, layer_id=layer_pk)

        if found.count() > 0:
            # Duplicate Layer
            messages.warning(request, "This layer has already been added to this Initiative.")
        else:
            # Add the Layer
            obj = models.InitiativeLayer()
            obj.initiative = ini
            obj.layer_id = layer_pk
            obj.membership = membership
            obj.save()
            messages.success(request, "Added Layer to Initiative")

    return redirect(reverse("initiatives:detail", kwargs={'slug': slug}))


@login_required
def add_mapstory(request, slug, mapstory_pk):
    """
        Adds a Mapstory to an Initiative.
        :param request: HTTPRequest
        :param slug: The Initiative's slug.
        :param mapstory_pk: Mapstory id
        :return: HTTPResponse
        """
    ini = get_object_or_404(models.Initiative, slug=slug)
    membership = get_object_or_404(
        models.InitiativeMembership,
        user__pk=request.user.pk,
        initiative=ini,
    )

    # Make sure we have permissions to do this
    if membership.is_admin or membership.is_active:
        pass
    else:
        messages.error(request, "You are not allowed to do this.")
        return redirect(reverse("initiatives:detail", kwargs={'slug': slug}))

    if request.POST:
        # Check if not already added
        found = models.InitiativeMapStory.objects.filter(initiative=ini, mapstory__pk=mapstory_pk)

        if found.count() > 0:
            # Give a warning to the user
            messages.warning(request, "This Mapstory has already been added to this Initiative.")
        else:
            # Add it to the Initiative
            obj = models.InitiativeMapStory()
            obj.initiative = ini
            obj.mapstory_id = mapstory_pk
            obj.membership = membership
            obj.save()
            messages.success(request, "Added MapStory to Initiative")

    return redirect(reverse("initiatives:detail", kwargs={'slug': slug}))


@login_required
def approve_membership(request, slug):
    """
        Approves a request for membership
        :param request: HTTP Request
        :param slug: The Initiatives's slug.
        :return: A new membership if success.
        """
    if not request.user.is_authenticated():
        messages.warning(request, "You are not logged in.")
        return redirect(reverse("index_view"))

    if request.POST:
        # Make sure that we have permission
        admin_membership = get_object_or_404(
            models.InitiativeMembership,
            initiative=get_object_or_404(models.Initiative, slug=slug),
            user_id=request.user.pk
        )

        if not admin_membership.is_admin:
            # No permission
            messages.warning(request, "You do not have permissions to do this.")
            return redirect(reverse("initiatives:detail", kwargs={'slug': slug}))
        else:
            # We have permission, continue
            request_pk = request.POST.get("request_pk")
            join_request = get_object_or_404(models.JoinRequest, pk=request_pk)
            approval = request.POST.get("approval")

            # Approve Request to join
            if approval == 'accept':
                new_membership = join_request.approve(admin_membership)
                messages.success(request, "New member added to Initiative.")

            # Decline Request to join
            elif approval == 'decline':
                join_request.decline(admin_membership)
                messages.success(request, "Request to join declined.")

    return redirect(reverse('initiatives:manage', kwargs={'slug': slug}))

