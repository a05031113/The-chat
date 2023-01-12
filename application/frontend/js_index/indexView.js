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
    },
    showLoginLoading: function showLoginLoading(){
        loginLoading.style.display = "flex";
    },
    hideLoginLoading: function hideLoginLoading(){
        loginLoading.style.display = "none";
    },
    showRegisterLoading: function showRegisterLoading(){
        registerLoading.style.display = "flex";
    },
    hideRegisterLoading: function hideRegisterLoading(){
        registerLoading.style.display = "none";
    }
}
export default view;
