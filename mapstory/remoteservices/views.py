# -*- coding: utf-8 -*-
#########################################################################
#
# Copyright (C) 2019 Planet Federal
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program. If not, see <http://www.gnu.org/licenses/>.
#
#########################################################################
import logging

from django.contrib import messages
from django.core.urlresolvers import reverse
from django.http import HttpResponse, HttpResponseRedirect, Http404
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.conf import settings
from django.core.paginator import EmptyPage, PageNotAnInteger, Paginator
from django.utils.translation import ugettext as _
from django.core.exceptions import ValidationError

from geonode.services import enumerations
from geonode.services.models import Service, HarvestJob
from geonode.services.views import _gen_harvestable_ids

from mapstory.utils import get_bearer_token
from mapstory.remoteservices import tasks
from mapstory.remoteservices.forms import MapstoryCreateServiceForm
from mapstory.remoteservices.serviceprocessors.handler \
    import get_service_handler

logger = logging.getLogger("geonode.core.layers.views")


@login_required
def register_service(request):
    service_register_template = "services/service_register.html"
    if request.method == "POST":
        form = MapstoryCreateServiceForm(request.POST)
        if form.is_valid():
            service_handler = form.cleaned_data["service_handler"]
            service = service_handler.create_geonode_service(
                owner=request.user)
            # Weird bug with headers added to the service where clean gives
            # a validation error on online_resource despite it appearing okay
            # TODO: Is it okay to proceed as normal?
            try:
                service.full_clean()
            except ValidationError as e:
                logger.warn("Got a validation error. Online resource: {0}\n"
                            "ValidationError: {1}"
                            .format(service.online_resource, e))
            service.save()
            service.keywords.add(*service_handler.get_keywords())
            service.set_default_permissions()
            if service_handler.indexing_method == enumerations.CASCADED:
                service_handler.create_cascaded_store()
            request.session[service_handler.url] = service_handler
            logger.debug("Added handler to the session")
            messages.add_message(
                request,
                messages.SUCCESS,
                _("Service registered successfully")
            )
            result = HttpResponseRedirect(
                reverse("harvest_resources",
                        kwargs={"service_id": service.id})
            )
        else:
            result = render(request, service_register_template, {"form": form})
    else:
        form = MapstoryCreateServiceForm()
        result = render(
            request, service_register_template, {"form": form})
    return result


def _get_service_handler(request, service):
    """Add the service handler to the HttpSession.
    We use the django session object to store the service handler's
    representation of the remote service between sequentially logic steps.
    This is done in order to improve user experience, as we avoid making
    multiple Capabilities requests (this is a time saver on servers that
    feature many layers.
    """
    headers = {'Authorization': "Bearer {}".format(
        get_bearer_token(valid_time=30, request=request))}

    service_handler = get_service_handler(
        service.base_url, service.proxy_base, service.type, headers=headers)
    request.session[service.base_url] = service_handler
    logger.debug("Added handler to the session")
    return service_handler


@login_required
def harvest_resources(request, service_id):
    service = get_object_or_404(Service, pk=service_id)
    try:
        handler = request.session[service.base_url]
    except KeyError:  # handler is not saved on the session, recreate it
        return redirect(
            reverse("rescan_service", kwargs={"service_id": service.id})
        )
    available_resources = handler.get_resources()
    is_sync = getattr(settings, "CELERY_TASK_ALWAYS_EAGER", False)
    errored_state = False
    if request.method == "GET":
        already_harvested = HarvestJob.objects.values_list(
            "resource_id", flat=True).filter(service=service, status=enumerations.PROCESSED)
        if available_resources:
            not_yet_harvested = [
                r for r in available_resources if str(r.id) not in already_harvested]
            not_yet_harvested.sort(key=lambda resource: resource.id)
        else:
            not_yet_harvested = ['Cannot parse any resource at this time!']
            errored_state = True
        paginator = Paginator(
            not_yet_harvested, getattr(settings, "CLIENT_RESULTS_LIMIT", 100))
        page = request.GET.get('page')
        try:
            harvestable_resources = paginator.page(page)
        except PageNotAnInteger:
            harvestable_resources = paginator.page(1)
        except EmptyPage:
            harvestable_resources = paginator.page(paginator.num_pages)
        result = render(
            request,
            "services/service_resources_harvest.html",
            {
                "service_handler": handler,
                "service": service,
                "importable": not_yet_harvested,
                "resources": harvestable_resources,
                "is_sync": is_sync,
                "errored_state": errored_state,
            }
        )
    elif request.method == "POST":
        requested = request.POST.getlist("resource_list")
        resources_to_harvest = []
        for id in _gen_harvestable_ids(requested, available_resources):
            logger.debug("id: {}".format(id))
            harvest_job, created = HarvestJob.objects.get_or_create(
                service=service,
                resource_id=id
            )
            if created or harvest_job.status != enumerations.PROCESSED:
                resources_to_harvest.append(id)
                tasks.harvest_resource.apply_async(
                    args=[harvest_job.id],
                    kwargs={'headers': {
                        'Authorization': "Bearer {0}".format(
                            get_bearer_token(valid_time=30,
                                             request=request))}},
                )
            else:
                logger.warning(
                    "resource {} already has a harvest job".format(id))
        msg_async = _("The selected resources are being imported")
        msg_sync = _("The selected resources have been imported")
        messages.add_message(
            request,
            messages.SUCCESS,
            msg_sync if is_sync else msg_async
        )
        go_to = (
            "harvest_resources" if handler.has_unharvested_resources(
                service) else "service_detail"
        )
        result = redirect(reverse(go_to, kwargs={"service_id": service.id}))
    else:
        result = None
    return result


@login_required
def harvest_single_resource(request, service_id, resource_id):
    service = get_object_or_404(Service, pk=service_id)
    handler = _get_service_handler(request, service)
    try:  # check that resource_id is valid for this handler
        handler.get_resource(resource_id)
    except KeyError:
        raise Http404()
    harvest_job, created = HarvestJob.objects.get_or_create(
        service=service,
        resource_id=resource_id,
    )
    if not created and harvest_job.status == enumerations.IN_PROCESS:
        raise HttpResponse(
            _("Resource is already being processed"), status=409)
    else:
        tasks.harvest_resource.apply_async(
            args=[harvest_job.id],
            kwargs={'headers': {'Authorization': "Bearer {0}".format(
                get_bearer_token(valid_time=30, request=request))}},
        )
    messages.add_message(
        request,
        messages.SUCCESS,
        _("Resource {} is being processed".format(resource_id))
    )
    return redirect(
        reverse("service_detail",
                kwargs={"service_id": service.id})
    )


@login_required
def rescan_service(request, service_id):
    service = get_object_or_404(Service, pk=service_id)
    try:
        _get_service_handler(request, service)
    except Exception:
        return render(
            request,
            "services/remote_service_unavailable.html",
            {"service": service}
        )
    logger.debug("Finished rescaning service. About to redirect back...")
    messages.add_message(
        request, messages.SUCCESS, _("Service rescanned successfully"))
    return redirect(
        reverse("harvest_resources", kwargs={"service_id": service_id}))
