from fastapi import *
from pydantic import *
from fastapi.templating import Jinja2Templates

router = APIRouter()
templates = Jinja2Templates(directory="./backend/templates")


class User(BaseModel):
    username: str
    password: str


@router.post("/login")
def login(request: Request, user: User):
    data = request.json()
    print(data)
    # {'username': 'test', 'password': 'test'}
    return {"message": "Success"}


@router.get("/")
async def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})
