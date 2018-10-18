import os

from django.conf import settings

from allauth.account.models import EmailAddress
from allauth.socialaccount.providers.base import AuthAction, ProviderAccount
from allauth.socialaccount.providers.oauth2.provider import OAuth2Provider


class GeoAxisAccount(ProviderAccount):

    def to_str(self):
        dflt = super(GeoAxisAccount, self).to_str()
        return self.account.extra_data.get('name', dflt)


class GeoAxisProvider(OAuth2Provider):
    id = 'geoaxis'
    name = 'GeoAxis'
    account_class = GeoAxisAccount

    def get_default_scope(self):
        return map(str.strip, os.getenv('ALLAUTH_GEOAXIS_SCOPES', 'UserProfile.me').split(','))

    def extract_uid(self, data):
        return str(data['uid'])

    def extract_common_fields(self, data):
        return dict(email=data.get('email'),
                    last_name=data.get('lastnamename'),
                    first_name=data.get('firstname'))

    def extract_email_addresses(self, data):
        ret = []
        ret.append(EmailAddress(email=data.get('email'),
                                verified=True,
                                primary=True))
        return ret


provider_classes = [GeoAxisProvider]
