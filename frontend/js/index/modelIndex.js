import view from "./viewIndex.js";

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
            const response = await fetch("/api/refresh", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                }
            });
            if (response.status === 200){
                window.location.href = "/chat";
            }else{
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

export default model;