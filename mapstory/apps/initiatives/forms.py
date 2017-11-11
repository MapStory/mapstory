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
    name = forms.CharField(required=True, widget=forms.TextInput(attrs={'class': 'org_manage_field'}))
    slogan = forms.CharField(required=True, widget=forms.TextInput(attrs={'class': 'org_manage_field'}))
    city = forms.CharField(required=False, widget=forms.TextInput(attrs={'class': 'org_manage_field'}))
    country = forms.CharField(required=False, widget=forms.TextInput(attrs={'class': 'org_manage_field'}))
    image = forms.ImageField(required=False)
    about = forms.CharField(widget=forms.Textarea(attrs={'class': 'org_manage_field'}), required=True)