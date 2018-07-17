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

from django.contrib import admin
from . import models


class AuditEventAdmin(admin.ModelAdmin):

    def get_actions(self, request):
        actions = super(AuditEventAdmin, self).get_actions(request)
        del actions['delete_selected']
        return actions

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    list_display = [
        'datetime',
        'event',
        'username',
        'ip',
        'email',
        'fullname',
        'superuser',
        'staff',
        'resource_type',
        'resource_uuid',
        'resource_title'
    ]

    search_fields = [
        'event',
        'username',
        'ip',
        'email',
        'fullname',
        'resource_type',
        'resource_uuid',
        'resource_title'
    ]

    def __init__(self, *args, **kwargs):
        super(AuditEventAdmin, self).__init__(*args, **kwargs)
        self.list_display_links = (None, )


admin.site.register(models.AuditEvent, AuditEventAdmin)
