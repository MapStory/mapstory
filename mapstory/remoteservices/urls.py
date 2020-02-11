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

from django.conf.urls import patterns, url

urlpatterns = patterns(
    'mapstory.remoteservices.views',
    url(r'^register/$', 'register_service', name="register_service"),
    url(r'^(?P<service_id>\d+)/rescan$', 'rescan_service',
        name='rescan_service'),
    url(r'^(?P<service_id>\d+)/harvest$', 'harvest_resources',
        name='harvest_resources'),
    url(r'^(?P<service_id>\d+)/harvest/(?P<resource_id>\S+)',
        'harvest_single_resource', name='harvest_single_resource'),
)
