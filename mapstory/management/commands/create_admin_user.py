from django.core.management.base import BaseCommand

from geonode.people.models import Profile


class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument(
            '--name',
            dest='username',
            default='admin',
            help='name for the admin user'
        )
        parser.add_argument(
            '--password',
            dest='password',
            default='admin',
            help='password for the admin user'
        )

    def handle(self, *args, **options):
        try:
            user = Profile.objects.get(username=options['username'])
            print(("User {} already exists.".format(user)))
        except Profile.DoesNotExist:
            print(("User {} does not exist, creating user.".format(
                options['username'])))
            p, _ = Profile.objects.get_or_create(username=options['username'])
            p.is_staff = p.is_superuser = True
            p.set_password(options['password'])
            p.save()
