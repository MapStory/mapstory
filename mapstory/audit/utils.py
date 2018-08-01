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

import json
from .settings import AUDIT_LOGFILE_LOCATION
from geonode.base.models import ContactRole
from geonode.documents.models import Document
from geonode.layers.models import Layer
from geonode.maps.models import Map
from time import gmtime, strftime


def get_audit_crud_dict(instance, event):
    """get audit crud details and return as dictionary"""
    audit_models = [ContactRole, Document, Layer, Map]
    for idx, item in enumerate(audit_models):
        if isinstance(instance, item):
            d = {}
            # populate resource details from instance
            d['resource'] = get_resource(instance)
            # user details are only accessible via geonode contactroles
            if d['resource']['type'] == 'contactrole':
                d['user_details'] = get_user_crud_details(instance.contact)
            # determine if created or updated
            d['event'] = event
            d['event_time_gmt'] = get_time_gmt()
            return d


def get_audit_login_dict(request, user, event):
    """get user login details and return as user_details dictionary"""
    d = {
        "user_details": {
            "username": getattr(user, user.USERNAME_FIELD),
            "ip": get_client_ip(request),
            "superuser": user.is_superuser,
            "staff": user.is_staff,
            "fullname": user.get_full_name() or None,
            "email": user.email or None
        },
        "event": event,
        "event_time_gmt": get_time_gmt()
    }
    return d


def get_time_gmt():
    """get current datetime as gmt"""
    return strftime("%Y-%m-%d %H:%M:%S", gmtime())


def get_resource(instance):
    """get geonode object resource details and return as resource dictonary"""
    # Determine resource type from the model
    if isinstance(instance, Document):
        resource_type = 'document'
    elif isinstance(instance, Layer):
        resource_type = 'layer'
    elif isinstance(instance, Map):
        resource_type = 'map'
    else:
        resource_type = "contactrole"
    # set contactrole resource type to associated model
    if resource_type == 'contactrole':
        instance = instance.resource
    # create resource dict
    resource = {
        "uuid": instance.uuid,
        "title": instance.title,
        "type": resource_type
    }
    return resource


def get_user_crud_details(contact):
    """get user crud details and return as user_details dictionary"""
    user_details = {
        "username": contact.username,
        "superuser": contact.is_superuser,
        "staff": contact.is_staff,
        "fullname": contact.get_full_name() or None,
        "email": contact.email or None
    }
    return user_details


def write_entry(d):
    """write dictionary to json file output"""
    with open(AUDIT_LOGFILE_LOCATION, 'a') as j:
        json.dump(d, j, sort_keys=True)
        j.write('\n')
        j.close()


def get_client_ip(request):
    """get client ip from reguest"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[-1].strip()
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip
