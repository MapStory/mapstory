from django.test import Client


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
