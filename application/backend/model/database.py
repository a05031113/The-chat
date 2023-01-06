import pymongo
import os
from dotenv import load_dotenv
load_dotenv()


def database():
    client = pymongo.MongoClient(os.getenv("cosmosDB"))
    db = client.chat_data
    return db
