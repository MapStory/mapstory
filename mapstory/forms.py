import autocomplete_light
from account.forms import SignupForm
from django import forms
from django.utils.translation import ugettext_lazy as _
from geonode.base.forms import ResourceBaseForm
from geonode.layers.models import Layer
from geonode.base.forms import Profile

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


class UploadLayerForm(ResourceBaseForm):

    poc = forms.CharField(
        label=_("poc"),
        widget=forms.HiddenInput(),
        required=False,
    )

    metadata_author = forms.CharField(
        label=_("metadata_author"),
        widget=forms.HiddenInput(),
        required=False,
    )

    supplemental_information = forms.CharField(
        label=_('Data Source'),
        required=False,
        widget=forms.TextInput(),
        initial=''
    )

    data_quality_statement = forms.CharField(
        label=_('Data Quality'),
        widget=forms.TextInput(),
        required=False,
    )


    def __init__(self, *args, **kwargs):
        super(UploadLayerForm, self).__init__(*args, **kwargs)
        for field in 'date temporal_extent_start temporal_extent_end thumbnail_url'.split():
            self.fields.pop(field)

    class Meta(ResourceBaseForm.Meta):
        model = Layer
        exclude = ResourceBaseForm.Meta.exclude + (
            'workspace',
            'store',
            'storeType',
            'typename',
            'default_style',
            'styles',
            'upload_session',
            'service',
            'owner',
            'date',
            'date_type',
            'edition',
            'abstract',
            'purpose',
            'maintenance_frequency',
            'restriction_code_type',
            'constraints_other',
            'license',
            'language',
            'spatial_representation_type',
            'distribution_url',
            'distribution_description',
            'is_published',
            'featured'
        )

        widgets = autocomplete_light.get_widgets_dict(Layer)