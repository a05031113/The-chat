import model from "../model/indexModel.js";
import view from "../view/indexView.js";

const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const loginBtn = document.getElementById("loginBtn");
const registerName = document.getElementById("registerName");
const registerEmail = document.getElementById("registerEmail");
const registerPassword = document.getElementById("registerPassword");
const registerConfirm = document.getElementById("registerConfirm");
const registerBtn = document.getElementById("registerBtn");
const createBtn = document.getElementById("createBtn");
const popup = document.getElementById("popup");
const leaveBtn = document.getElementById("leaveBtn");
const loginErrorMsg = document.getElementById("loginErrorMsg");
const registerErrorMsg = document.getElementById("registerErrorMsg");
let controller = {
    init: async function(){
        await model.refresh();
    }
};
controller.init();
loginBtn.addEventListener("click", ()=>{
    if (!loginEmail.value | !loginPassword){
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
    if (!registerEmail.value | !registerPassword.value | !registerName.value){
        view.registerErrorMessage("Please fill up the blank");
        return false;
    }
    if (!model.validateEmail(registerEmail)){
        view.registerErrorMessage("Wrong email format");
        return false;
    }
    if (!model.validatePassword(registerPassword)){
        view.registerErrorMessage("Wrong password format");
        return false;
    }
    if (!model.confirmation(registerPassword, registerConfirm)){
        view.registerErrorMessage("Passwords are different");
        return false
    }
    const data = {
        "name": registerName.value,
        "email": registerEmail.value,
        "password": registerPassword.value,
        "confirmation": registerConfirm.value
    }
    model.register(data);
})
createBtn.addEventListener("click", view.showRegister);
leaveBtn.addEventListener("click", view.closeRegister);

