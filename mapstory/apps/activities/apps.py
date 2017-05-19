from django.apps import AppConfig


class ActivitiesAppConfig(AppConfig):
    name = 'mapstory.apps.activities'

    def ready(self):
        from actstream import registry
        from django.contrib.auth import get_user_model
        from mapstory.mapstories.models import MapStory
        from icon_commons.models import Icon
        # Register for activity streams
        # actstream_registry.register(get_user_model())
        # actstream_registry.register(MapStory)
        # actstream_registry.register(self.get_model('MapStory'))
        registry.register(Icon)
