from werkzeug.security import *
from fastapi_jwt_auth import *
from fastapi_jwt_auth.exceptions import *
from pydantic import *
from .database import *
from datetime import *
from dotenv import load_dotenv
import os
import re
load_dotenv()


class process():
    def register(register_data):
        id = register_data.email.split("@")[0]
        output = {
            "user_information": {
                "name": register_data.name,
                "id": id,
                "email": register_data.email,
                "password": generate_password_hash(register_data.password),
                "head-photo": "none"
            },
            "messages": {}
        }
        return output

    def login(Authorize, user):
        access_expires = timedelta(days=1)
        refresh_expires = timedelta(days=7)
        access_token = Authorize.create_access_token(
            subject=str(user["_id"]), expires_time=access_expires)
        refresh_token = Authorize.create_refresh_token(
            subject=str(user["_id"]), expires_time=refresh_expires)
        Authorize.set_access_cookies(access_token)
        Authorize.set_refresh_cookies(refresh_token)

    def refresh(Authorize):
        current_user = Authorize.get_jwt_subject()
        access_token = Authorize.create_access_token(subject=current_user)
        Authorize.set_access_cookies(access_token)

    def logout(Authorize):
        Authorize.unset_jwt_cookies()

    def user_id(Authorize):
        current_user = Authorize.get_jwt_subject()
        return current_user


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
