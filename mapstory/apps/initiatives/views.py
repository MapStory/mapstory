from django.shortcuts import render, get_object_or_404, redirect
from django.core.exceptions import SuspiciousOperation
from django.core.urlresolvers import reverse
from django.contrib import messages

from . import models


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
    membership = models.InitiativeMembership.objects.filter(user__pk=request.user.pk)

    if membership.count() > 0:
        membership = membership.first()
    if membership.count() > 1:
        raise SuspiciousOperation('More than one membership found for this user in initiatives')
    else:
        membership = None

    return render(request, 'initiatives/detail.html', context={
        'ini': ini,
        'members': members,
        'layers': layers,
        'mapstories': mapstories,
        'membership': membership,
        'ini_image': ini.image,
    })


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