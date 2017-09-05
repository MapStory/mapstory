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
    name = forms.CharField()
    slogan = forms.CharField()
    city = forms.CharField()
    country = forms.CharField()
    image = forms.FileField()
    about = forms.CharField(widget=forms.Textarea)

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
    url0 = forms.URLField()
    url1 = forms.URLField()
    url2 = forms.URLField()
    facebook = forms.URLField()
    twitter = forms.URLField()
    linkedin = forms.URLField()
    github = forms.URLField()
    instragram = forms.URLField()
