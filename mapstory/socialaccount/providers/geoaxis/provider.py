from django.conf import settings
from allauth.account.models import EmailAddress
from allauth.socialaccount.providers.base import AuthAction, ProviderAccount
from allauth.socialaccount.providers.oauth2.provider import OAuth2Provider

class GeoAxisAccount(ProviderAccount):
    def get_profile_url(self):
        return self.account.extra_data.get('link')

    def get_avatar_url(self):
        return self.account.extra_data.get('picture')

    def to_str(self):
        dflt = super(GeoAxisAccount, self).to_str()
        return self.account.extra_data.get('name', dflt)


class GeoAxisProvider(OAuth2Provider):
    id = 'geoaxis'
    name = 'GeoAxis'
    account_class = GeoAxisAccount

    def get_default_scope(self):
        return settings.ALLAUTH_GEOAXIS_SCOPE

    #def get_auth_params(self, request, action):
    #    ret = super(GeoAxisProvider, self).get_auth_params(request,
    #                                                      action)
    #    if action == AuthAction.REAUTHENTICATE:
    #        ret['prompt'] = 'select_account consent'
    #    return ret

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