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

from geonode.services.forms import CreateServiceForm
from django.core.exceptions import ValidationError
from django.utils.translation import ugettext as _
from django.conf import settings
from geonode.services import enumerations
from mapstory.remoteservices.serviceprocessors.handler \
    import get_service_handler
from urllib2 import HTTPError as urllibHTTPError
from requests.exceptions import HTTPError, ConnectionError
try:
    if 'ssl_pki' not in settings.INSTALLED_APPS:
        raise ImportError
    from ssl_pki.models import (
        has_ssl_config,
        ssl_config_for_url
    )
except ImportError:
    has_ssl_config = None
    ssl_config_for_url = None


class MapstoryCreateServiceForm(CreateServiceForm):
    @staticmethod
    def validate_pki_url(url):
        """Validates the pki protected url and its associated certificates"""
        ssl_config = ssl_config_for_url(url)
        try:
            if ssl_config is None:
                # Should have an SslConfig, but this could happen
                raise ValidationError
            ssl_config.clean()
        except ValidationError:
            raise ValidationError(
                _("Error with SSL or PKI configuration for url: {0}. "
                  "Please contact your Administrator.".format(url))
            )

    def clean(self):
        """Validates form fields that depend on each other"""
        url = self.cleaned_data.get("url")
        service_type = self.cleaned_data.get("type")
        if url is not None and service_type is not None:
            # Check pki validation
            if callable(has_ssl_config) and has_ssl_config(url):
                self.validate_pki_url(url)

        if url is not None and service_type is not None:
            try:
                service_handler = get_service_handler(
                    base_url=url, service_type=service_type)
            # WMS raises requests.exceptions.HTTPError
            except HTTPError as e:
                status_code = e.response.status_code
                if status_code == 500 or status_code == 403:
                    raise ValidationError(
                        _("HTTP {0} error. This could be due to authorization "
                          "failure. Please contact your Administrator"
                          " to confirm SSL or PKI configuration is correct."
                          .format(status_code)))
                elif status_code == 404:
                    raise ValidationError(
                        _("HTTP {0} error. The host of this service may be "
                          "down or inaccessible.".format(status_code)))
                else:
                    raise ValidationError(
                        _("Unknown error connecting to {0}: HTTP {1} error."
                          .format(url, status_code)))
            # ArcREST raises urllib2.HTTPError
            except urllibHTTPError as e:
                if e.code == 500 or e.code == 403:
                    raise ValidationError(
                        _("HTTP {0} error. This could be due to authorization "
                          "failure. Please contact your Administrator"
                          " to confirm SSL or PKI configuration is correct."
                          .format(e.code)))
                elif e.code == 404:
                    raise ValidationError(
                        _("HTTP {0} error. The host of this service may be "
                          "down or inaccessible.".format(e.code)))
                else:
                    raise ValidationError(
                        _("Unknown error connecting to {0}: HTTP {1} error."
                          .format(url, e.code)))
            except ConnectionError:
                raise ValidationError(
                    _("Connection timed out attempting to access {0} - "
                      "host may be down or inaccessible".format(url)))
            except KeyError:
                raise ValidationError(
                    _("Could not find a matching service at {0} - "
                      "host exists, but service name does not. Please ensure "
                      "the service name is typed correctly and present on "
                      "this host.".format(url)))
            except Exception:
                raise ValidationError(
                    _("Could not connect to the service at {0} "
                      "for an unknown reason".format(url))
                )
            if not service_handler.has_resources():
                raise ValidationError(
                    _("Could not find importable resources for the service "
                      "at {0}".format(url))
                )
            elif service_type not in (enumerations.AUTO, enumerations.OWS):
                if service_handler.service_type != service_type:
                    raise ValidationError(
                        _("Found service of type {0} instead "
                          "of {1}".format(
                            service_handler.service_type, service_type))
                    )
            self.cleaned_data["service_handler"] = service_handler
            self.cleaned_data["type"] = service_handler.service_type
