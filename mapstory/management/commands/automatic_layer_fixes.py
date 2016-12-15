from django.core.management.base import BaseCommand
from geoserver.catalog import Catalog
from pick import pick
import requests
from geonode.geoserver.helpers import ogc_server_settings

import json

class Command(BaseCommand):
    help = 'This command checks layers on the given server and provides diagnostics and automatic fixes to some common layer issues'

    def add_arguments(self, parser):
        parser.add_argument(
            '--server-rest-url',
            dest='server-rest-url',
            default=ogc_server_settings.rest
        )
        parser.add_argument(
            '--server-username',
            dest='server-username',
            default='admin',
            help='geoserver admin username'
        )
        parser.add_argument(
            '--server-pass',
            dest='server-pass',
            default='admin',
            help='geoserver admin password'
        )
        parser.add_argument(
            '--layers',
            dest='layer_list',
            default=None,
            help='optional list of layer names to grab instead of all layers'
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            dest='dry-run',
            default=False,
            help='do not make any layer fixes only capture errors and potential fixes.'
        )

    def print_invalid_list(self, invalid_layers):
        self.stdout.write('==============Unfixable Layers========================')
        for invalid_layer in invalid_layers:
            self.stdout.write('Could not fix {0}: {1}'.format(invalid_layer['name'], invalid_layer['error']))

    def handle(self, *args, **options):

        rest_url = options['server-rest-url']
        rest_user = options['server-username']
        rest_pass = options['server-pass']
        dry_run = options['dry-run']
        gs = Catalog(rest_url, rest_user, rest_pass)
        layers = gs.get_layers()

        if options['layer_list'] is not None:
            layers = options['layer_list'].split(',')

        unfixable = []
        valid = []

        def add_unfixable(layer_name, reason):
            layer = {'name': layer_name,
                     'error': reason }
            unfixable.append(layer)

        def add_valid(layer_name, logged_attributes):
            valid_layer = {'name': layer_name}
            for key, value in logged_attributes.items():
                valid_layer[key] = value
            valid.append(valid_layer)

        def check_valid_attribute(validation_object, object_to_check, attribute_to_check, default_value_to_check):
            attribute = getattr(object_to_check, attribute_to_check)
            if attribute is not None and attribute is not default_value_to_check:
                validation_object[attribute_to_check] = attribute
                return True
            else:
                return False

        def fix_time_enabled(self, layer_object, validation_dict, dry_run):
            resource = layer_object.resource
            metadata = dict(resource.metadata)
            metadata['time'].enabled = True
            resource.metadata = metadata
            if dry_run is False:
                resource.catalog.save(resource)

            check_layer = gs.get_layer(layer_object.name)
            if check_valid_attribute(validation_dict, check_layer.resource.metadata.get('time'), 'enabled', False) is False:
                self.stdout.write('Could not enable time for {0}'.format(layer_object.name))
            else:
                self.stdout.write('Time has been enabled for {0}'.format(layer_object.name))

        def fix_time_presentation(self, layer_object, validation_dict, dry_run):
            resource = layer_object.resource
            metadata = dict(resource.metadata)
            metadata['time'].presentation = 'LIST'
            resource.metadata = metadata
            if dry_run is False:
                resource.catalog.save(resource)

            check_layer = gs.get_layer(layer_object.name)
            if check_valid_attribute(validation_dict, check_layer.resource.metadata.get('time'), 'presentation', 'LIST') is False:
                self.stdout.write('Could not set presentation for {0}'.format(layer_object.name))
            else:
                self.stdout.write('Presentation has been set to list for {0}'.format(layer_object.name))

        def fix_time_attribute(self, layer_object, validation_dict, dry_run):
            # find date fields
            resource = layer_object.resource
            metadata = dict(resource.metadata)

            fields = requests.get(layer_object.resource.href.replace('.xml', '.json'), auth=(rest_user, rest_pass))
            the_fields = fields.json()['featureType']['attributes']
            dates = [field.get('name') for field in the_fields['attribute'] if 'Time' in field.get('binding') or 'Date' in field.get('binding')]

            if len(dates) == 0:
                add_unfixable(layer_object.name, 'Layer does not contain a time attribute')
                return
            elif len(dates) == 1:
                metadata['time'].attribute = dates[0]
            else:
                title = 'More than one date field found for {0} please select which to use for time attribute'.format(layer_object.name)
                option, index = pick(dates, title)
                metadata['time'].attribute = dates[index]

            resource.metadata = metadata
            if dry_run is False:
                resource.catalog.save(resource)

            check_layer = gs.get_layer(layer_object.name)
            if check_valid_attribute(validation_dict, check_layer.resource.metadata.get('time'), 'attribute', None) is False:
                self.stdout.write('Could not set attribute for {0}'.format(layer_object.name))
            else:
                self.stdout.write('Attribute set to {0} for {1}'.format(metadata['time'].attribute, layer_object.name))

        for lyr in layers:
            lyr_obj = lyr
            if type(lyr) is str:
                lyr_obj = gs.get_layer(lyr)

            if lyr_obj is None:
                add_unfixable(lyr, 'Layer does not exist')
                self.stdout.write('{} does not exist'.format(lyr))
                continue
            layer_validation = dict()

            if lyr_obj.resource.metadata:
                dimension_info = lyr_obj.resource.metadata.get('time')
                if dimension_info is not None:

                    if check_valid_attribute(layer_validation, dimension_info, 'enabled', False) is False:
                        fix_time_enabled(self, lyr_obj, layer_validation, dry_run)

                    if check_valid_attribute(layer_validation, dimension_info, 'presentation', 'LIST') is False:
                        fix_time_presentation(self, lyr_obj, layer_validation, dry_run)

                    if check_valid_attribute(layer_validation, dimension_info, 'attribute', None) is False:
                        fix_time_attribute(self, lyr_obj, layer_validation, dry_run)
                else:
                    add_unfixable(lyr, 'Layer was not uploaded with time configured.')

            add_valid(lyr, layer_validation)

        self.print_invalid_list(unfixable)
