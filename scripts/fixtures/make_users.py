from geonode.people.models import Profile
from itertools import product

names = product(['George', 'John', 'Tom', 'Jim', 'Andy'], ['Jackson', 'Adams', 'Monroe', 'Washington', 'Jefferson'])
for first,last in names:
    user = first + last
    Profile.objects.create(username=user.lower(), first_name=first, last_name=last)