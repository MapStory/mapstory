from django.apps import AppConfig


class SslPkiAppSupportConfig(AppConfig):
    name = 'mapstory.sslpki'
    label = 'sslpki'
    verbose_name = 'SSL/PKI Support'

    def ready(self):
        # noinspection PyUnresolvedReferences
        from . import signals  # noqa
