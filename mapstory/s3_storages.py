from django.conf import settings

from storages.backends.s3boto import S3BotoStorage


class StaticStorage(S3BotoStorage):
    location = getattr(settings, 'STATICFILES_LOCATION', None)


class MediaStorage(S3BotoStorage):
    location = getattr(settings, 'MEDIAFILES_LOCATION', None)
