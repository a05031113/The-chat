from flask import *
import mysql.connector as connector

index_controller = Blueprint("index_controller", __name__)


@index_controller.route("/")
def index():
    return render_template("index.html")


@index_controller.route("/test")
def test():
    db = connector.connect(
        host="mysqldb",
        user="root",
        password="Password",
        database="test"
    )
    cursor = db.cursor()

    cursor.execute("SELECT * FROM test")

    result = cursor.fetchall()
    print(result)

    return result
