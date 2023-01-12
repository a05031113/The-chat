from fastapi import *
from fastapi.responses import *
from pydantic import *
from fastapi_jwt_auth import *
from application.backend.model.r2 import *
from application.backend.model.database import *


api_user = APIRouter()


@api_user.get("/api/user/upload-url")
async def get_R2_url(Authorize: AuthJWT = Depends()):
    Authorize.jwt_required()
    try:
        current_user = Authorize.get_jwt_subject()
        file_name = current_user + "_profile_photo"
        photo_url = "https://pub-6cd56288498e4af5b3650c296ca21e82.r2.dev/" + file_name
        database_user().head_photo_url(photo_url, current_user)
        return r2().get_put_url(file_name)
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": True, "msg": str(e)})
