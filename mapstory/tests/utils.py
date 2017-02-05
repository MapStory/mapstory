"""
Test Utilities and helpers
"""
import string
import random
from django.contrib.auth import get_user_model
from geonode.maps.models import Map, MapStory

User = get_user_model()


def get_test_user():
    """
    Returns an existing user or
    a new one if no users exist.

    Returns:
        TYPE: User
    """
    allUsers = User.objects.all()
    if allUsers.count() > 0 :
        return allUsers[0]
    else :
        return User.objects.create_user(username='modeltester',
                                 email='modeltester@models.com',
                                 password='glassonion232123')



def create_user(username, password, **kwargs):
    """
    Creates a user and saves it

    :param username: The username
    :param password: The password
    :param kwargs:  Additional parameters

    Returns:
        (username, password)
    """
    user, created = get_user_model().objects.get_or_create(username=username, **kwargs)

    if created:
        user.set_password(password)
        user.save()

    return username, password



def create_admin_user(username, password):
    """
    Creates a superuser
    :param username: The username
    :param password: The password
    :return: (username, password)
    """
    return create_user(username, password, is_superuser=True)



def create_map(owner, title):
    """
    Creates a new Map

    :param owner:(User) The map's owner
    :param title: (String) The map's title
    :return:(Map) A Map model object
    """
    return Map.objects.create(owner=owner, zoom=1, center_x=0, center_y=0, title=title)

def create_mapstory(owner, title):
    return MapStory.objects.create(owner=owner, title=title)

def id_generator(size=6, chars=string.ascii_lowercase + string.digits):
    return ''.join(random.choice(chars) for _ in range(size))

def generate_testname(prefix="test", size=6):
    return "%s_%s" % (prefix, id_generator(size=size))


