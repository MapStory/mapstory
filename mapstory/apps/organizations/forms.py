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
    name = forms.CharField(required=True)
    slogan = forms.CharField(required=True)
    city = forms.CharField(required=False)
    country = forms.CharField(required=False)
    image = forms.FileField(required=False)
    about = forms.CharField(widget=forms.Textarea, required=True)

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
    url0 = forms.URLField(required=False)
    url1 = forms.URLField(required=False)
    url2 = forms.URLField(required=False)
    facebook = forms.URLField(required=False)
    twitter = forms.URLField(required=False)
    linkedin = forms.URLField(required=False)
    github = forms.URLField(required=False)
    instragram = forms.URLField(required=False)
