import model from "./modelIndex.js";
import view from "./viewIndex.js";


loginBtn.addEventListener("click", ()=>{
    view.showLoginLoading();
    if (!loginEmail.value | !loginPassword){
        view.hideLoginLoading();
        view.loginErrorMessage("Please fill up the blank");
        return false;
    }
    const data = {
        "email": loginEmail.value,
        "password": loginPassword.value
    }
    model.login(data);
});

registerBtn.addEventListener("click", ()=>{
    view.showRegisterLoading();
    if (!registerEmail.value | !registerPassword.value | !registerName.value){
        view.hideRegisterLoading();
        view.registerErrorMessage("Please fill up the blank");
        return false;
    }
    if (!model.validateEmail(registerEmail)){
        view.hideRegisterLoading();
        view.registerErrorMessage("Wrong email format");
        return false;
    }
    if (!model.validatePassword(registerPassword)){
        view.hideRegisterLoading();
        view.registerErrorMessage("Wrong password format");
        return false;
    }
    if (!model.confirmation(registerPassword, registerConfirm)){
        view.hideRegisterLoading();
        view.registerErrorMessage("Passwords are different");
        return false
    }
    const data = {
        "username": registerName.value,
        "email": registerEmail.value,
        "password": registerPassword.value,
        "confirm": registerConfirm.value
    }
    model.register(data);
});
createBtn.addEventListener("click", view.showRegister);

leaveBtn.addEventListener("click", view.closeRegister);

let controller = {
    init: async function(){
        await model.refresh();
        loading.style.display = "none";
    }
};
controller.init();
