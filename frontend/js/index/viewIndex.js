let view = {
    showRegister: function showRegister(){
        popup.style.display = "flex";
    },
    closeRegister: function closeRegister(){
        popup.style.display = "none";
    },
    loginErrorMessage: function loginErrorMessage(msg){
        loginErrorMsg.textContent = msg
    },
    registerErrorMessage: function registerErrorMessage(msg){
        registerErrorMsg.textContent = msg;
    }
}

export default view;