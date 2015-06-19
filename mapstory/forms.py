from account.forms import SignupForm
from django import forms
from django.utils.translation import ugettext_lazy as _


class MapStorySignupForm(SignupForm):
    """
    Extends the accounts SignupForm to include the user's first and last name.
    """

    firstname = forms.CharField(
        label=_("First name"),
        max_length=30,
        widget=forms.TextInput(),
        required=True
    )

    lastname = forms.CharField(
        label=_("Last name"),
        max_length=30,
        widget=forms.TextInput(),
        required=True
    )
