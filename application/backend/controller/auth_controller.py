from fastapi import *
from application.backend.model.auth_model import *

auth_router = APIRouter()


@auth_router.get("/api/user")
async def user(Authorize: AuthJWT = Depends()):
    Authorize.jwt_required()
    current_user = Authorize.get_jwt_subject()
    return {"user": current_user}


@auth_router.post("/api/auth")
async def register(register_data: Register_data):
    if not validation.email_valid(register_data.email):
        return {"detail": "Wrong email format"}
    if not validation.password_valid(register_data.password):
        return {"detail": "Wrong password format"}
    if not validation.confirm_valid(register_data.password, register_data.confirmation):
        return {"detail": "Passwords are different"}
    if user_data().search_user(register_data.email):
        raise HTTPException(status_code=400, detail="Account exist")
    else:
        user_data().register(process.register(register_data))
        return {"msg": "Welcome"}


@auth_router.put("/api/auth")
async def login(login_data: Login_data, Authorize: AuthJWT = Depends()):
    user = user_data().search_user(login_data.email)
    if user and check_password_hash(user["password"], login_data.password):
        process.login(Authorize, user)
        return {"msg": "welcome"}
    else:
        raise HTTPException(
            status_code=400, detail="Please check your email or password")


@auth_router.get('/refresh')
async def refresh(Authorize: AuthJWT = Depends()):
    process.refresh(Authorize)
    return {"msg": "The token has been refresh"}


@auth_router.delete('/logout')
async def logout(Authorize: AuthJWT = Depends()):
    process.logout(Authorize)
    return {"msg": "Successfully logout"}
