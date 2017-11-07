from django import forms


class BasicInformation(forms.Form):
    """
    Collects basic information for an Initiative
        - Initiative Name
        - Initiative Slogan
        - City
        - Country
        - Display Photo
        - About
    """
    name = forms.CharField(required=True)
    slogan = forms.CharField(required=True)
    city = forms.CharField(required=False)
    country = forms.CharField(required=False)
    image = forms.ImageField(required=False)
    about = forms.CharField(widget=forms.Textarea, required=True)