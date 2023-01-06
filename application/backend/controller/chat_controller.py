from fastapi import *
from pydantic import *
from fastapi_jwt_auth import *
from fastapi.templating import Jinja2Templates

chat_router = APIRouter()
templates = Jinja2Templates(directory="./application/templates")


@chat_router.get("/chat")
async def index(request: Request):
    return templates.TemplateResponse("chat.html", {"request": request})
