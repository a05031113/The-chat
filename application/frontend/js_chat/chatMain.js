import model from "./chatModel.js";
import view from "./ChatView.js";

const logout = document.getElementById("logout");
const loading = document.getElementById("loading");
const photoIcon = document.getElementById("photoIcon");
const backBlock = document.getElementById("backBlock");
const profileBox = document.getElementById("profileBox");
const changePhoto = document.getElementById("changePhoto");
const uploadPhoto = document.getElementById("uploadPhoto");
const changedImg = document.getElementById("changedImg");
const saveProfile = document.getElementById("saveProfile");


let controller = {
    init: async function(){
        await model.refresh();
        await model.getHeadPhoto();
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
uploadPhoto.addEventListener("change", (event)=>{
    const file = event.target.files[0];
    if (file){
        let src = URL.createObjectURL(file);
        changedImg.src = src;
        // avc
    }
});
saveProfile.addEventListener("click", ()=>{
    const file = uploadPhoto.files[0]
    model.updateProfilePhoto(file);
})