from django import forms

from geonode.base.models import ResourceBase
import taggit

from mapstory.mapstories.models import MapStory


# A form for just keywords
class KeywordsForm(forms.ModelForm):

    class Meta:
        model = ResourceBase
        fields = ['keywords']


# A form for a Mapstory-specific distribution_url field
class DistributionUrlForm(forms.ModelForm):

    def __init__(self, *args, **kwargs):
        super(DistributionUrlForm, self).__init__(*args, **kwargs)
        self.fields['distribution_url'].label = "Data Source"

    class Meta:
        model = MapStory
        fields = ['distribution_url']


# A form for just Metadata
class MetadataForm(forms.ModelForm):

    def __init__(self, *args, **kwargs):
        super(MetadataForm, self).__init__(*args, **kwargs)
        self.fields['abstract'].label = "Summary"

    class Meta:
        model = ResourceBase
        fields = [
            'title',
            'category',
            'abstract',
            'language',
            'data_quality_statement',
            'purpose',
            'is_published',
        ]


# A form for just publishing status
class PublishStatusForm(forms.ModelForm):

    class Meta:
        model = ResourceBase
        fields = ['is_published']
