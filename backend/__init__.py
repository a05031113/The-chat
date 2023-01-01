from fastapi import *
from fastapi.staticfiles import StaticFiles

from backend.routers.index_route import *


def create_app():
    app = FastAPI()
    app.mount("/static", StaticFiles(directory="./backend/static"), name="static")
    app.include_router(router)

    return app
