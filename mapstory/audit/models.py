# -*- coding: utf-8 -*-
#########################################################################
#
# Copyright (C) 2017 Boundless Spatial
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

from django.db import models


class AuditEvent(models.Model):
    id = models.AutoField(verbose_name='ID',
                          serialize=False,
                          auto_created=True,
                          primary_key=True)
    event = models.CharField(max_length=16, null=True, blank=True)
    username = models.CharField(max_length=255, null=True, blank=False)
    ip = models.GenericIPAddressField(null=True, blank=True)
    email = models.EmailField(null=True, blank=True)
    fullname = models.CharField(max_length=255, null=True, blank=True)
    superuser = models.NullBooleanField()
    staff = models.NullBooleanField()
    datetime = models.DateTimeField(auto_now_add=True)
    resource_type = models.CharField(max_length=16, null=True, blank=True)
    resource_uuid = models.CharField(max_length=64, null=True, blank=True)
    resource_title = models.CharField(max_length=255, null=True, blank=True)

    class Meta:
        verbose_name = 'audit event'
        verbose_name_plural = 'audit events'
        ordering = ['-datetime']
