import json

from django.conf import settings
from django.contrib import messages
from django.contrib.auth import logout
from django.contrib.auth.decorators import login_required
from django.urls import reverse
from django.http import HttpResponseForbidden
from django.shortcuts import (get_object_or_404, redirect, render,
                              render_to_response)
from django.views.generic.detail import DetailView

from actstream.models import actor_stream
from allauth.account.adapter import DefaultAccountAdapter
from geonode.people.models import Profile
from icon_commons.models import Icon
from geonode.favorite.models import Favorite
from mapstory.journal.models import JournalEntry
from osgeo_importer.forms import UploadFileForm

from .forms import (DeactivateProfileForm, EditGeonodeProfileForm,
                    EditMapstoryProfileForm, EditStoryScapesProfileForm)


class ProfileDetail(DetailView):
    model = Profile
    template_name = 'people/profile_detail.html'
    slug_field = 'username'

    def get_context_data(self, **kwargs):
        ctx = super(ProfileDetail, self).get_context_data(**kwargs)
        ctx['journal_entries'] = JournalEntry.objects.filter(
            author=self.object).order_by('-date')
        ctx['journal_entries_total'] = JournalEntry.objects.filter(
            author=self.object).count()
        ctx['journal_entries_published'] = JournalEntry.objects.filter(
            author=self.object, publish=True).count()
        ctx['favorites'] = Favorite.objects.filter(
            user=self.object).order_by('-created_on')
        ctx['icons'] = Icon.objects.filter(owner=self.object)
        ctx['action_list'] = actor_stream(ctx['profile'])
        # need to render the form
        ctx['form'] = UploadFileForm()
        ctx['interests'] = json.dumps(
            self.object.mapstoryprofile.interests_slug_list())

        return ctx


class MapStoryAccountAdapter(DefaultAccountAdapter):

    def get_login_redirect_url(self, request):
        path = "/storyteller/edit/{username}/"
        return path.format(username=request.user.username)


class StoryScapesAccountAdapter(DefaultAccountAdapter):

    def get_login_redirect_url(self, request):
        path = "/"
        return path.format(username=request.user.username)


@login_required
def profile_edit(request, username=None):
    # TODO this if/else needs updated for mapstoryprofile
    if username is None:
        try:
            profile = request.user.profile
        except Profile.DoesNotExist:
            return redirect("profile_browse")
    else:
        profile = get_object_or_404(Profile, username=username)

    if username == request.user.username:
        if request.method == "POST":
            geonode_form = EditGeonodeProfileForm(request.POST,
                                                  instance=request.user)
            if settings.ACCOUNT_EXTRA_PROFILE_FORM == 'EditMapstoryProfileForm':
                extra_form = EditMapstoryProfileForm(request.POST,
                                                     instance=request.user.mapstoryprofile)

            if settings.ACCOUNT_EXTRA_PROFILE_FORM == 'EditStoryScapesProfileForm':
                extra_form = EditStoryScapesProfileForm(
                    request.POST, instance=request.user.mapstoryprofile)

            if geonode_form.is_valid() and extra_form.is_valid():
                geonode_form.save()
                extra_form.save()
                messages.success(request, "Profile profile updated.")
                return redirect(
                    reverse(
                        'profile_detail',
                        args=[
                            request.user.username]))
        else:
            geonode_form = EditGeonodeProfileForm(instance=request.user)
            if settings.ACCOUNT_EXTRA_PROFILE_FORM == 'EditMapstoryProfileForm':
                extra_form = EditMapstoryProfileForm(
                    instance=request.user.mapstoryprofile)
            if settings.ACCOUNT_EXTRA_PROFILE_FORM == 'EditStoryScapesProfileForm':
                extra_form = EditStoryScapesProfileForm(
                    instance=request.user.mapstoryprofile)

        return render(request, "people/profile_edit.html", {
            "geonode_profile_form": geonode_form,
            "extra_profile_form": extra_form
        })
    else:
        return HttpResponseForbidden(
            'You are not allowed to edit other users profile')


@login_required
def profile_delete(request, username=None):
    if username is None:
        try:
            profile = request.user.profile
        except Profile.DoesNotExist:
            return redirect("profile_browse")
    else:
        profile = get_object_or_404(Profile, username=username)

    if username == request.user.username:
        if request.method == "POST":
            form = DeactivateProfileForm(request.POST, instance=profile)
            if form.is_valid():
                form.save()
                messages.success(request, "Profile has been deactivated.")
                logout(request)
                return redirect(reverse("index_view"))
        else:
            form = DeactivateProfileForm(instance=profile)

        return render(request, "people/profile_delete.html", {
            "form": form,
        })
    else:
        return HttpResponseForbidden(
            'You are not allowed to delete other users profile')
