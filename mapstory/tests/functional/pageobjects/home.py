from django.conf import settings
'''
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from .base import BasePage

class LoginModal(object):
    def get(self, browser):
        return

    @property
    def signup_tab(self):
        return self.get().find_element()




class HomePage(BasePage):
    def get(self):
        self.browser.get(settings.SITEURL)

    @property
    def title(self):
        return self.browser.title

    @property
    def login_icon(self):
        return self.browser.find_element(By.XPATH, '//*[@id="navbar"]/ul[1]/li/a/i')

    @property
    def create_link(self):
        return self.browser.find_element(By.NAME, 'Create')

    @property
    def login_modal(self):
        return self.browser.find_element(By.ID, 'loginModal')

    @property
    def signup_tab(self):
        return self.login_modal.find_element(By.LINK_TEXT, 'Sign Up')

    @property
    def login_tab(self):
        return self.login_modal.find_element(By.LINK_TEXT, 'Log In')

    @property
    def signup_div(self):
        return self.login_modal.find_element(By.ID, 'signup')

    @property
    def user_link(self):
        return self.browser.find_element(By.ID, 'id_userlink')

    @property
    def signup_form(self):

        return {
            'username' : self.signup_div.find_element(By.ID, 'id_username'),
            'first_name': self.signup_div.find_element(By.ID, 'id_first_name'),
            'last_name': self.signup_div.find_element(By.ID, 'id_last_name'),
            'email': self.signup_div.find_element(By.ID, 'id_email'),
            'password': self.signup_div.find_element(By.ID, 'id_password'),
            'confirm_password': self.signup_div.find_element(By.ID, 'password_confirm'),
        }

    def logout(self):
        pass

    def login(self, username, password):
        pass

    def signup(self, username, first, last, password, email, accepts=False):
        self.login_icon.click()
        self.signup_tab.click()
        form = self.signup_form
        form['username'].send_keys(username)
        form['first_name'].send_keys(first)
        form['last_name'].send_keys(last)
        form['email'].send_keys(email)
        form['password'].send_keys(password)
        form['confirm_password'].send_keys(password)

        wait = WebDriverWait(self.browser, 10)


        # agree = wait.until(EC.presence_of_element_located((By.ID, 'id_agree')))
        agree = self.signup_div.find_element(By.ID, 'id_agree')
        agree.click()
        button = wait.until(EC.visibility_of_element_located((By.ID, 'join-mapstory-button')))
        button.click()
        self.browser.save_screenshot('screenshot01.png')
'''