from django.apps import AppConfig


class ActivitiesAppConfig(AppConfig):
    name = 'mapstory.apps.activities'

    def ready(self):
        # Imports need to happen here once things are ready.
        # Please do not move these.
        from actstream import registry
        from icon_commons.models import Icon

        # Register Icon for Activity Strreams
        registry.register(Icon)
