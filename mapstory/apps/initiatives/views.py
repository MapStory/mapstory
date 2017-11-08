from django.contrib.auth.decorators import login_required
from django.shortcuts import render, get_object_or_404, redirect
from django.core.exceptions import SuspiciousOperation
from django.core.urlresolvers import reverse
from django.contrib import messages
from django.http import HttpResponse, HttpResponseForbidden


from . import models
from . import forms


def initiatives_list(request):
    initiatives = models.Initiative.objects.all()
    return render(request, 'initiatives/list.html', context={
        'initiatives': initiatives
    })


def initiative_detail(request, slug):
    ini = get_object_or_404(models.Initiative, slug=slug)
    members = models.InitiativeMembership.objects.filter(initiative=ini, is_active=True)
    layers = models.InitiativeLayer.objects.filter(initiative=ini)
    mapstories = models.InitiativeMapStory.objects.filter(initiative=ini)
    membership = models.InitiativeMembership.objects.filter(initiative=ini, user__pk=request.user.pk)

    if membership.count() > 1:
        raise SuspiciousOperation('More than one membership found for this user in initiatives')
    if membership.count() > 0:
        membership = membership.first()



    return render(request, 'initiatives/detail.html', context={
        'ini': ini,
        'members': members,
        'layers': layers,
        'mapstories': mapstories,
        'membership': membership,
        'ini_image': ini.image,
    })


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
        # TODO: Show the login popup.
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
        return HttpResponse("You are not authorized!")

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
    return HttpResponse("Hola")


@login_required
def add_mapstory(request, slug, mapstory_pk):
    return HttpResponse("add_mapstory")


@login_required
def approve_membership(request, slug):
    return HttpResponse("Hello member")

