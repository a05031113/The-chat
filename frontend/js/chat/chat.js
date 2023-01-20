import model from "./modelChat.js";
import view from "./viewChat.js";

const logout = document.getElementById("logout");
const loading = document.getElementById("loading");
const photoIcon = document.getElementById("photoIcon");
const profileIcon = document.getElementById("profileIcon");
const backBlock = document.getElementById("backBlock");
const profileBox = document.getElementById("profileBox");
const changePhoto = document.getElementById("changePhoto");
const uploadPhoto = document.getElementById("uploadPhoto");
const changedImg = document.getElementById("changedImg");
const saveProfile = document.getElementById("saveProfile");

const popup = document.getElementById("popup");
const leaveBtn = document.getElementById("leaveBtn");
const profileSetup = document.getElementById("profileSetup");


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
uploadPhoto.addEventListener("change", (event)=>{
    const file = event.target.files[0];
    if (file){
        let src = URL.createObjectURL(file);
        changedImg.src = src;
    }
});
saveProfile.addEventListener("click", async ()=>{
    const file = uploadPhoto.files[0]
    await model.refresh;
    await model.updateProfilePhoto(file);
});
leaveBtn.addEventListener("click", ()=>{
    view.leavePopup();
});
profileSetup.addEventListener("click", ()=>{
    view.showPopup();
    view.leaveProfile();
});


let controller = {
    init: async function(){
        await model.refresh();
        await model.getHeadPhoto();
    }
};
controller.init();