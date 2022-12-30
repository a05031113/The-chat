from flask import Flask
from .backend.controller import *


def create_app():
    app = Flask(__name__, static_folder="frontend", static_url_path="/static")

    with app.app_context():
        app.config["JSON_AS_ASCII"] = False
        app.config["TEMPLATES_AUTO_RELOAD"] = True

        app.register_blueprint(index_controller)

    return app
