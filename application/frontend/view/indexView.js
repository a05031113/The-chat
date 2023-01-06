let view = {
    showRegister: function showRegister(){
        popup.className = "flex fixed h-full w-full justify-center left-0 top-0 bg-gray-200 z-2";
    },
    closeRegister: function closeRegister(){
        popup.className = "hidden fixed h-full w-full justify-center left-0 top-0 bg-gray-200 z-2";
    },
    loginErrorMessage: function loginErrorMessage(msg){
        loginErrorMsg.textContent = msg
    },
    registerErrorMessage: function registerErrorMessage(msg){
        registerErrorMsg.textContent = msg;
    }
}
export default view;
