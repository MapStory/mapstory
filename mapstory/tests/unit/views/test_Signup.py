from django.test import Client, TestCase
from django.core.urlresolvers import reverse


class TestSignupView(TestCase):
    def test_uses_template(self):
        response = self.client.get(reverse('account_signup'))
        self.assertTemplateUsed(response, 'site_base.html')

    def test_passes_correct_form_to_temlate(self):
        # self.assertEqual(response.context[''])
        pass
