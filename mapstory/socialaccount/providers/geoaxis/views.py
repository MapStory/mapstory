import os

import requests

from allauth.socialaccount.providers.oauth2.views import (OAuth2Adapter,
                                                          OAuth2CallbackView,
                                                          OAuth2LoginView)

from .provider import GeoAxisProvider


class GeoAxisOAuth2Adapter(OAuth2Adapter):
    provider_id = GeoAxisProvider.id
    access_token_url = 'https://{0}/ms_oauth/oauth2/endpoints/' \
                       'oauthservice/tokens'.format(
                           os.getenv("ALLAUTH_GEOAXIS_HOST", 'localhost'))
    authorize_url = 'https://{0}/ms_oauth/oauth2/endpoints/' \
        'oauthservice/authorize'.format(
            os.getenv("ALLAUTH_GEOAXIS_HOST", 'localhost'))
    profile_url = 'https://{0}/ms_oauth/resources/userprofile/me'\
        .format(os.getenv("ALLAUTH_GEOAXIS_HOST", 'localhost'))
    basic_auth = True
    redirect_uri_protocol = 'https'

    def complete_login(self, request, app, token, **kwargs):
        resp = requests.get(self.profile_url,
                            params={'access_token': token.token},
                            headers={'Authorization': token.token})
        resp.raise_for_status()
        extra_data = resp.json()
        login = self.get_provider() \
            .sociallogin_from_response(request,
                                       extra_data)
        return login


oauth2_login = OAuth2LoginView.adapter_view(GeoAxisOAuth2Adapter)
oauth2_callback = OAuth2CallbackView.adapter_view(GeoAxisOAuth2Adapter)
