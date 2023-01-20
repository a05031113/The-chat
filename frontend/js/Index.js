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
const loading = document.getElementById("loading");
const loginLoading = document.getElementById("loginLoading");
const registerLoading = document.getElementById("registerLoading");

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

let model = {
    login: async function login(data){
        try{
            const response = await fetch("/api/auth", {
                method: "PUT",
                body: JSON.stringify(data),
                headers: {
                    "Content-type": "application/json",
                }
            });
            const result = await response.json();
            if (response.status === 200){
                console.log(result.headPhoto)
                window.location.href = "/chat";
            }else{
                view.hideLoginLoading();
                view.loginErrorMessage(result.error);
            }
        }catch(error){
            view.hideLoginLoading();
            console.log({"error": error})
        }
    },
    register: async function register(data){
        try{
            const response = await fetch("/api/auth", {
                method: "POST",
                body: JSON.stringify(data),
                headers: {
                    "Content-type": "application/json",
                }
            });
            const result = await response.json();
            if (response.status === 200){
                const loginData = {
                    "email": data.email,
                    "password": data.password
                }
                model.login(loginData)
            }else{
                view.hideRegisterLoading();
                view.registerErrorMessage(result.error)
            }
        }catch(error){
            console.log({"error": error})
        }
    },
    refresh: async function refresh(){
        try{
            const response = await fetch("/api/auth/refresh", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                }
            });
            if (response.status === 200){
                window.location.href = "/chat";
            }else{
                loading.style.display = "none";
                return false;
            }
        }catch(error){
            console.log({"error": error})
        }
    },
    validateEmail: function validateEmail(input) {
        let validRegex = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/;
        if (input.value.match(validRegex)) {
            return true;
        } else {
            return false;
        }
    },
    validatePassword: function validatePassword(input) {
        let validRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
        if (input.value.match(validRegex)) {
            return true;
        } else {
            return false;
        }
    },
    confirmation: function confirmation(pass, confirm){
        if (pass.value === confirm.value){
            return true;
        }else{
            return false;
        }
    },
}


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
    }
};
controller.init();