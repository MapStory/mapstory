from django.core.urlresolvers import reverse
from django.test import TestCase, Client
from django.contrib.auth import get_user_model
from unittest import skip
from models import JournalEntry, get_group_journals


User = get_user_model()


def get_test_user():
    """
    Returns an existing user or
    a new one if no users exist.

    Returns:
        TYPE: User
    """
    allUsers = User.objects.all()
    if allUsers.count() > 0 :
        return allUsers[0]
    else :
        return User.objects.create_user(username='modeltester',
                                 email='modeltester@models.com',
                                 password='glassonion232123')

# Get a user for testing
testUser = get_test_user()


class AdminClient(Client):
    def login_as_admin(self, username='admin', password='admin'):
        """
        Convenience method to login admin.
        """
        return self.login(**{'username': username, 'password': password})

    def login_as_non_admin(self, username='non_admin', password='non_admin'):
        """
        Convenience method to login a non-admin.
        """
        return self.login(**{'username': username, 'password': password})

@skip("TODO: Fix this test")
def test_journal_renders(self):
    """
    Ensure the journal functionality works.
    """
    c = AdminClient()
    response = c.get(reverse('journal'))
    self.assertEqual(response.status_code, 200)
    self.assertHasGoogleAnalytics(response)

    response = c.get(reverse('journal-create'))
    self.assertLoginRequired(response)

    c.login_as_non_admin()
    response = c.get(reverse('journal-create'))
    self.assertEqual(response.status_code, 200)
    self.assertHasGoogleAnalytics(response)

    response = c.get(reverse('journal-detail', args=[1]))
    self.assertEqual(response.status_code, 404)

    data = {'title': 'testing a new journal', 'content': 'This is test content'}
    response = c.post(reverse('journal-create'), data=data, follow=True)
    self.assertEqual(response.status_code, 200)
    self.assertHasGoogleAnalytics(response)

    journal = JournalEntry.objects.get(title=data['title'])
    self.assertEqual(journal.author, response.context['user'])
    self.assertEqual(journal.content, data['content'])
    self.assertFalse(journal.publish)
    self.assertFalse(journal.show_on_main)

    data['publish'] = True
    data['show_on_main'] = True

    response = c.post(reverse('journal-update', args=[journal.id]), data=data, follow=True)
    self.assertEqual(response.status_code, 200)
    journal = JournalEntry.objects.get(title=data['title'])
    self.assertTrue(journal.publish)
    self.assertFalse(journal.show_on_main)

    response = c.get(reverse('journal'))
    self.assertIn(journal, response.context['object_list'])


class TestJournalEntry(TestCase):
    """
    JournalEntry model tests
    """
    def setUp(self):
        self.journalEntry = JournalEntry()
        self.journalEntry.title = "Test title"
        self.journalEntry.author = testUser
        self.journalEntry.show_on_main = False

    def test_import(self):
        """
        Should import module
        """
        self.assertIsNotNone(JournalEntry)
        self.assertIsNotNone(get_group_journals)


    def test_unicode(self):
        """
        Should return unicode value
        """
        self.assertIsNotNone(unicode(self.journalEntry))
        self.assertTrue(unicode(self.journalEntry).endswith(self.journalEntry.title))

    @skip("TODO: Fix this test")
    def test_save_and_retrieve(self):
        """
        Should save and retrieve
        """
        self.assertEqual(0, JournalEntry.objects.all().count(), "Should be empty")
        self.journalEntry.save()

        allEntries = JournalEntry.objects.all()
        self.assertEqual(1, allEntries.count(), "Should have 1 entry")

        entry = allEntries[0]
        self.assertIsInstance(entry, JournalEntry, "Should be an instance of JournalEntry")

        # Make sure the correct values have been saved
        self.assertEqual(entry.title, self.journalEntry.title, "Should have same title")
        self.assertEqual(entry.author.name,
                         self.journalEntry.author.name,
                         "Should have same authors")

        self.assertEqual(entry.show_on_main, False)

    @skip("TODO")
    def test_get_absolute_url(self):
        self.assertIsNotNone(self.journalEntry.get_absolute_url())

    def test_has_plural(self):
        self.assertIsNotNone(JournalEntry._meta.verbose_name_plural)
