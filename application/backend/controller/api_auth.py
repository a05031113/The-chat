from fastapi import *
from fastapi.responses import *
from application.backend.model.auth_model import *

api_auth = APIRouter()


@api_auth.get("/api/auth/user")
async def user(Authorize: AuthJWT = Depends()):
    Authorize.jwt_required()
    try:
        current_user = process.user_id(Authorize)
        return {"user_id": current_user}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": True, "msg": str(e)})


@api_auth.post("/api/auth")
async def register(register_data: Register_data):
    try:
        if not validation.email_valid(register_data.email):
            return JSONResponse(status_code=400, content={"error": True, "msg": "Wrong email format"})
        elif not validation.password_valid(register_data.password):
            return JSONResponse(status_code=400, content={"error": True, "msg": "Wrong password format"})
        elif not validation.confirm_valid(register_data.password, register_data.confirmation):
            return JSONResponse(status_code=400, content={"error": True, "msg": "Passwords are different"})
        elif database_user().search_user(register_data.email):
            return JSONResponse(status_code=400, content={"error": True, "msg": "Account exist"})
        else:
            database_user().register(process.register(register_data))
        return {"msg": "Welcome"}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": True, "msg": str(e)})


@api_auth.put("/api/auth")
async def login(login_data: Login_data, Authorize: AuthJWT = Depends()):
    try:
        user = database_user().login(login_data.email)
        if user and check_password_hash(user["password"], login_data.password):
            process.login(Authorize, user)
            return {"data": user}
        else:
            return JSONResponse(status_code=400, content={"error": True, "msg": "Please check your email or password"})
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": True, "msg": str(e)})


@api_auth.get('/refresh')
async def refresh(Authorize: AuthJWT = Depends()):
    Authorize.jwt_refresh_token_required()
    try:
        process.refresh(Authorize)
        return {"msg": "The token has been refresh"}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": True, "msg": str(e)})


@api_auth.delete('/logout')
async def logout(Authorize: AuthJWT = Depends()):
    try:
        process.logout(Authorize)
        return {"msg": "Successfully logout"}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": True, "msg": str(e)})
