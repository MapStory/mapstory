from django.test import TestCase

from mapstory.models import Sponsor

class SponsorModelTest(TestCase):
    def test_sponsor_name(self):
        sponsor = Sponsor(name='My Sponsor Name')
        self.assertEqual(unicode(sponsor), 'Sponsor - ' + sponsor.name)
