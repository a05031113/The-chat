from fastapi import *
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from application.backend.route import *
from application.backend.controller.api_auth import *
from application.backend.controller.api_user import *


def create_app():
    app = FastAPI()
    app.mount(
        "/static", StaticFiles(directory="./application/frontend"), name="static")
    app.include_router(router)
    app.include_router(api_auth)
    app.include_router(api_user)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    return app
