import autocomplete_light
from django import forms
from django.utils.translation import ugettext_lazy as _
from geonode.layers.models import Layer
from geonode.base.forms import Profile
from geonode.base.models import ResourceBase
import taggit
from geonode.groups.models import GroupProfile
from geonode.groups.forms import GroupForm, GroupUpdateForm
import account.forms


class SignupForm(account.forms.SignupForm):

    first_name = forms.CharField(label='First Name', max_length=100)
    last_name = forms.CharField(label='Last Name', max_length=100)


# A form for just keywords
class KeywordsForm(forms.ModelForm):

    class Meta:
        model = ResourceBase
        fields = ['keywords']


# A form for just Metadata
class MetadataForm(forms.ModelForm):

    def __init__(self, *args, **kwargs):
        super(MetadataForm, self).__init__(*args, **kwargs)
        # TODO this was removed upstream in 3ff5dff
        # self.fields['distribution_url'].label = "Data Source"
        self.fields['abstract'].label = "Summary"

    class Meta:
        model = ResourceBase
        fields = [
            'title',
            'category',
            'abstract',
            'language',
            # TODO this was removed upstream in 3ff5dff
            # 'distribution_url',
            'data_quality_statement',
            'purpose',
            'is_published',
        ]

# A form for just publishing status
class PublishStatusForm(forms.ModelForm):

    class Meta:
        model = ResourceBase
        fields = ['is_published']

# A form for just deactivating profile
class DeactivateProfileForm(forms.ModelForm):
    is_active = forms.BooleanField(help_text=_("Uncheck the field and select confirm to deactivate your profile."), required=False)

    class Meta:
        model = Profile
        fields = ['is_active']

# A form for the fields we want the user to be able to edit
class EditProfileForm(forms.ModelForm):
    Volunteer_Technical_Community = forms.BooleanField(help_text=_("Join the Volunteer Technical Community (What's this? <a href='http://wiki.mapstory.org/Volunteer_Technical_Community'>Learn more here</a>)"), required=False)
    keywords = taggit.forms.TagField(
        required=False,
        label='Interests',
        help_text=_("A list of personal interests (separate each interest with a comma)"))

    class Meta:
        model = Profile
        fields = ['first_name', 'last_name', 'keywords', 'city', 'country', 'profile', 'education', 'expertise', 'social_twitter', 'social_facebook', 'social_linkedin', 'social_github', 'Volunteer_Technical_Community']

# Organization forms
class OrganizationForm(GroupForm):

    class Meta:
        model = GroupProfile
        exclude = ['group', 'profile_type', 'tasks', 'featured']


class OrganizationUpdateForm(GroupUpdateForm):

    class Meta:
        model = GroupProfile
        exclude = ['group', 'profile_type', 'tasks', 'featured']
