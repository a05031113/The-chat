from fastapi import *
from pydantic import *
from fastapi.templating import Jinja2Templates

router = APIRouter()
templates = Jinja2Templates(directory="./application/templates")


@router.get("/")
async def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@router.get("/chat")
async def index(request: Request):
    return templates.TemplateResponse("chat.html", {"request": request})
