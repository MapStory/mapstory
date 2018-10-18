from django import forms
from django.utils.translation import ugettext_lazy as _

from allauth.account.forms import SignupForm
from geonode.people.models import Profile

from .models import MapstoryProfile


# Custom Signup Form
class CustomSignupForm(SignupForm):
    first_name = forms.CharField(max_length=30, label='First Name')
    last_name = forms.CharField(max_length=30, label='Last Name')

    field_order = ['username', 'first_name', 'last_name', 'email', 'password']

# A form for just deactivating profile


class DeactivateProfileForm(forms.ModelForm):
    is_active = forms.BooleanField(help_text=_(
        "Uncheck the field and select confirm to deactivate your profile."), required=False)

    class Meta:
        model = Profile
        fields = ['is_active']


# A form for the mapstory-specific fields we want the user to be able to edit
class EditMapstoryProfileForm(forms.ModelForm):
    Volunteer_Technical_Community = forms.BooleanField(help_text=_(
        "Join the Volunteer Technical Community (What's this? <a href='http://wiki.mapstory.org/Volunteer_Technical_Community'>Learn more here</a>)"), required=False)

    class Meta:
        model = MapstoryProfile
        fields = ['interests', 'education', 'expertise', 'social_twitter',
                  'social_facebook', 'social_linkedin', 'social_github',
                  'Volunteer_Technical_Community']


class EditStoryScapesProfileForm(forms.ModelForm):
    class Meta:
        model = MapstoryProfile
        fields = ['interests', 'education', 'expertise']


# Form with fields from the GeoNode Profile model to be edited
class EditGeonodeProfileForm(forms.ModelForm):

    class Meta:
        model = Profile
        fields = ['first_name', 'last_name', 'city', 'country',
                  'profile']
