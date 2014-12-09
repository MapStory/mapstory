from mapstory.models import Leader
from geonode.people.models import Profile
from django.contrib.webdesign import lorem_ipsum
import random

for p in Profile.objects.all():
    content = lorem_ipsum.words(50, common=False).split(' ')
    randoms = random.sample(range(len(content)), 10)
    for r in randoms:
        content[r] = content[r].join(random.sample('*_+@', 1)[0] * 2)
    content = ' '.join(content)
    Leader.objects.create(content=content, user=p)
