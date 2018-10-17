from django import forms


class BasicInformation(forms.Form):
    """
    Collects basic information for an Organization
        - Org Name
        - Org Slogan
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


class LinksAndSocialMedia(forms.Form):
    """
    LINKS & SOCIAL MEDIA
    --------------------
        - URLs
        - Facebook
        - Twitter
        - LinkedIn
        - Github
        - Instragram
    """
    url0 = forms.URLField(required=False, widget=forms.URLInput(attrs={'class': 'org_manage_field'}))
    url1 = forms.URLField(required=False, widget=forms.URLInput(attrs={'class': 'org_manage_field'}))
    url2 = forms.URLField(required=False, widget=forms.URLInput(attrs={'class': 'org_manage_field'}))
    facebook = forms.URLField(required=False, widget=forms.URLInput(attrs={'class': 'org_manage_field'}))
    twitter = forms.URLField(required=False, widget=forms.URLInput(attrs={'class': 'org_manage_field'}))
    linkedin = forms.URLField(required=False, widget=forms.URLInput(attrs={'class': 'org_manage_field'}))
    github = forms.URLField(required=False, widget=forms.URLInput(attrs={'class': 'org_manage_field'}))
    instagram = forms.URLField(required=False, widget=forms.URLInput(attrs={'class': 'org_manage_field'}))
