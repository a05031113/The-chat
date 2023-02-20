import model from "./modelIndex.js";
import view from "./viewIndex.js";


loginBtn.addEventListener("click", ()=>{
    loginBtn.disabled = true;
    if (!loginEmail.value | !loginPassword){
        loginBtn.disabled = false;
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
    registerBtn.disabled = true;
    if (!registerEmail.value | !registerPassword.value | !registerName.value){
        registerBtn.disabled = false;
        view.registerErrorMessage("Please fill up the blank");
        return false;
    }
    if (!model.validateEmail(registerEmail)){
        registerBtn.disabled = false;
        view.registerErrorMessage("Wrong email format");
        return false;
    }
    if (!model.validatePassword(registerPassword)){
        registerBtn.disabled = false;
        view.registerErrorMessage("Wrong password format");
        return false;
    }
    if (!model.confirmation(registerPassword, registerConfirm)){
        registerBtn.disabled = false;
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
        loginEmail.value = "demo@demo.com";
        loginPassword.value = "Demo1234";
    }
};
controller.init();
