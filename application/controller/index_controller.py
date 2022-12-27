from flask import *

index_controller = Blueprint("index_controller", __name__)


@index_controller.route("/")
def index():
    return render_template("index.html")
