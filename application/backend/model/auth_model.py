from werkzeug.security import *
from fastapi_jwt_auth import *
from fastapi_jwt_auth.exceptions import *
from pydantic import *
from .database import *
from datetime import *
from dotenv import load_dotenv
import re
load_dotenv()


class user_data():
    def __init__(self):
        self.db = database()
        self.collection = self.db.users

    def register(self, input):
        self.collection.insert_one(input)

    def search_user(self, input):
        check_email = {"email": input}
        return self.collection.find_one(check_email)


class process():
    def register(register_data):
        output = {
            "name": register_data.name,
            "email": register_data.email,
            "password": generate_password_hash(register_data.password)
        }
        return output

    def login(Authorize, user):
        access_expires = timedelta(days=1)
        refresh_expires = timedelta(days=7)
        access_token = Authorize.create_access_token(
            subject=user["email"], expires_time=access_expires)
        refresh_token = Authorize.create_refresh_token(
            subject=user["email"], expires_time=refresh_expires)
        Authorize.set_access_cookies(access_token)
        Authorize.set_refresh_cookies(refresh_token)

    def refresh(Authorize):
        Authorize.jwt_refresh_token_required()
        current_user = Authorize.get_jwt_subject()
        access_token = Authorize.create_access_token(subject=current_user)
        Authorize.set_access_cookies(access_token)

    def logout(Authorize):
        Authorize.unset_jwt_cookies()


class validation:
    def email_valid(email):
        email_regex = re.compile(
            r'^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$')
        if re.fullmatch(email_regex, email):
            return True
        else:
            return False

    def password_valid(password):
        password_regex = re.compile(
            r'^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$')
        if re.fullmatch(password_regex, password):
            return True
        else:
            return False

    def confirm_valid(password, confirmation):
        if password == confirmation:
            return True
        else:
            return False


class Register_data(BaseModel):
    name: str
    email: str
    password: str
    confirmation: str


class Login_data(BaseModel):
    email: str
    password: str


class Settings(BaseModel):
    authjwt_secret_key: str = os.getenv("secret_key")
    authjwt_token_location: set = {"cookies"}
    authjwt_cookie_csrf_protext: bool = False
