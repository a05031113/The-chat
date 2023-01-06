from fastapi import *
from fastapi.staticfiles import StaticFiles
from application.backend.controller.index_controller import *
from application.backend.controller.auth_controller import *
from application.backend.controller.chat_controller import *


def create_app():
    app = FastAPI()
    app.mount(
        "/static", StaticFiles(directory="./application/frontend"), name="static")
    app.include_router(index_router)
    app.include_router(auth_router)
    app.include_router(chat_router)

    return app
