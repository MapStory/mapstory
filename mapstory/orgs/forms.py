from django import forms
from mapstory.orgs.models import Org


class OrgForm(forms.ModelForm):

    class Meta:
        model = Org
        exclude = ['group', 'profile_type', 'featured']
