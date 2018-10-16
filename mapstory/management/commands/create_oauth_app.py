from django.core.management.base import BaseCommand

from geonode.people.models import Profile
from oauth2_provider.models import Application


class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument(
            '--name',
            dest='name',
            default='GeoServer',
            help='name of the application'
        )
        parser.add_argument(
            '--user',
            dest='user',
            default='admin',
            help='name of the user'
        )
        parser.add_argument(
            '--client-id',
            dest='client-id',
            default='',
            help='client id'
        )
        parser.add_argument(
            '--secret',
            dest='secret',
            default='',
            help='client secret'
        )
        parser.add_argument(
            '--redirect-uri',
            dest='redirect-uri',
            default='https://docker',
            help='redirect uri'
        )

    def handle(self, *args, **options):
        app, _ = Application.objects.get_or_create(name=options['name'])
        u, _ = Profile.objects.get_or_create(username=options['user'])
        app.user = u
        app.user_id = u.id
        app.client_type = 'confidential'
        app.authorization_grant_type = 'authorization-code'
        app.client_id = options['client-id']
        app.client_secret = options['secret']
        app.redirect_uris = '{uri}\n{uri}/'.format(
            uri=options['redirect-uri'].strip('/'))
        app.save()
