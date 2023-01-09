import model from "../model/chatModel.js";
import view from "../view/chatView.js";

const logout = document.getElementById("logout");
const loading = document.getElementById("loading");
const photoIcon = document.getElementById("photoIcon");
const backBlock = document.getElementById("backBlock");
const profileBox = document.getElementById("profileBox");
const changePhoto = document.getElementById("changePhoto");
const uploadPhoto = document.getElementById("uploadPhoto");

let controller = {
    init: async function(){
        await model.refresh();
    }
};
controller.init();

logout.addEventListener("click", ()=>{
    model.logout();
});
photoIcon.addEventListener("click", view.enterProfile);
window.addEventListener("click", (event)=>{
    if (event.target === backBlock){
        view.leaveProfile();
    }
});
changePhoto.addEventListener("click", ()=>{
    uploadPhoto.click();
});