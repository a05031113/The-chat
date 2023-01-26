import model from "./modelChat.js";
import view from "./viewChat.js";

const logout = document.getElementById("logout");
const loading = document.getElementById("loading");
const photoIcon = document.getElementById("photoIcon");
const profileIcon = document.getElementById("profileIcon");
const backBlock = document.getElementById("backBlock");
const profileBox = document.getElementById("profileBox");

const chatBoxContent = document.getElementById("chatBoxContent");

let changePhoto;
let uploadPhoto;
let saveProfile;
let changedImg;

let addFriendBtn;

const popup = document.getElementById("popup");
const popupContent = document.getElementById("popupContent");
const leaveBtn = document.getElementById("leaveBtn");
const profileSetup = document.getElementById("profileSetup");

const friendBtn = document.getElementById("friendBtn");
const chatBtn = document.getElementById("chatBtn");
const addBtn = document.getElementById("addBtn");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");

const listContent = document.getElementById("listContent");

let allUserData;
let addData;
let addedData;
let userData;

let friendMode = true;
let chatMode = false;
let addMode = false;





logout.addEventListener("click", ()=>{
    model.logout();
});

photoIcon.addEventListener("click", view.enterProfile);
window.addEventListener("click", (event)=>{
    if (event.target === backBlock){
        view.leaveCorner();
    }
});

leaveBtn.addEventListener("click", ()=>{
    view.leavePopup();
});

profileSetup.addEventListener("click", ()=>{
    view.showPopup();
    view.showProfile(userData.HeadPhoto);
    view.leaveCorner();
    changePhoto = document.getElementById("changePhoto");
    saveProfile = document.getElementById("saveProfile");
    uploadPhoto = document.getElementById("uploadPhoto");
    changedImg = document.getElementById("changedImg");
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
});

friendBtn.addEventListener("click", async ()=>{
    friendMode = true;
    chatMode = false;
    addMode = false;
    view.showFriend(userData.Friend, allUserData);
    model.addFriendClick(".friend-list");
});

chatBtn.addEventListener("click", async ()=>{
    friendMode = false;
    chatMode = true;
    addMode = false;
    view.showChat();
});

addBtn.addEventListener("click", async ()=>{
    friendMode = false;
    chatMode = false;
    addMode = true;
    view.showAdd(allUserData, addedData);
    let addFriendList = document.querySelectorAll(".add-added-friend");
    for (let i=0; i<addFriendList.length; i++){
        addFriendList[i].addEventListener("click", async (event)=>{
            view.showPopup();
            view.checkAdd(event.currentTarget.firstElementChild.src, event.currentTarget.lastElementChild.textContent);
            const checkAddedBtn = document.getElementById("checkAddedBtn");
            const data = {
                "id": addedData[addFriendList.length - i - 1]
            }
            checkAddedBtn.addEventListener("click", async ()=>{
                let auth = await model.refresh();
                if (!auth){
                    return false;
                }
                let addStatus = await model.checkAdded(data)
                if (!addStatus){
                    return false;
                }
                if (!userData.Friend){
                    userData.Friend = [addedData[addFriendList.length - i - 1]];
                }else{
                    userData.Friend.push(addedData[addFriendList.length - i - 1]);
                }
                const index = addedData.indexOf(addedData[addFriendList.length - i - 1]);
                if (index > -1){
                    addedData.splice(index, 1);
                }
                view.leavePopup();
                view.showAdd(allUserData, addedData);
            });
        });
    };
});

searchInput.addEventListener("change", async ()=>{
    let auth = await model.refresh();
    if (!auth){
        return false;
    }
    if (friendMode){
        for (let i = 0; i < allUserData.data.length; i++){
            if (searchInput.value === allUserData.data[i].username){
                if (userData.Friend.includes(allUserData.data[i]._id)){
                    view.searchFriend(allUserData.data[i])
                }
            }
        }
    }else if(chatMode){
        model.chatMode();
    }else if(addMode){
        let searchResult = await model.addMode(allUserData, addData);
        if (searchResult){
            addFriendBtn = document.getElementById("addFriendBtn");
            addFriendBtn.addEventListener("click", async ()=>{
                let auth = await model.refresh();
                if (!auth){
                    return false;
                }
                const data = {"id": searchResult};
                let result = await model.addFriend(data);
                if (result){
                    view.addSent();
                    if (!addData){
                        addData = []
                    }
                    addData.push(searchResult);
                }
            });
        }
    }
    searchInput.value = "";
});



let controller = {
    init: async function(){
        await model.refresh();
        userData = await model.getUserData();
        allUserData = await model.allUser();
        console.log(allUserData)
        console.log(userData)
        model.loadHeadPhoto(userData.HeadPhoto);
        view.showFriend(userData.Friend, allUserData);
        loading.style.display = "none";
        model.addFriendClick(".friend-list");
        const addResponse = await model.addData();
        addData = addResponse.add;
        addedData = addResponse.added;
    },
};
controller.init();