import pymongo
import os
from dotenv import load_dotenv
from bson.objectid import ObjectId
load_dotenv()


def database():
    client = pymongo.MongoClient(os.getenv("cosmosDB"))
    db = client.chat_data
    return db


class database_user():
    def __init__(self):
        self.db = database()
        self.collection = self.db.users

    def register(self, input):
        self.collection.insert_one(input)

    def search_user(self, email):
        check_email = {"user_information.email": email}
        return self.collection.find_one(check_email)

    def login(self, email):
        check_email = {"user_information.email": email}
        data = self.collection.find_one(check_email)
        return {
            "_id": str(data["_id"]),
            "password": data["user_information"]["password"],
            "id": data["user_information"]["id"],
            "headPhoto": data["user_information"]["head-photo"]
        }

    def head_photo_url(self, photo_url, current_user):
        self.collection.update_one(
            {"_id": ObjectId(current_user)}, {
                "$set": {"user_information.head-photo": photo_url}
            })
