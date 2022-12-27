from flask import *
from .controller import *


def create_app():
    app = Flask(__name__)

    with app.app_context():
        app.config["JSON_AS_ASCII"] = False
        app.config["TEMPLATES_AUTO_RELOAD"] = True

        app.register_blueprint(index_controller)

    return app
