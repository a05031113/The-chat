import model from "./modelChat.js";
import view from "./viewChat.js";


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

friendBtn.addEventListener("click", ()=>{
    friendMode = true;
    chatMode = false;
    addMode = false;
    view.showFriend(userData.Friend, allUserData);
    controller.friendClick(allUserData.data, userData);
});

chatBtn.addEventListener("click", ()=>{
    friendMode = false;
    chatMode = true;
    addMode = false;
    view.showChat(userData, allUserData, roomList);
    controller.chatClick(allUserData, userData);
});

addBtn.addEventListener("click", ()=>{
    friendMode = false;
    chatMode = false;
    addMode = true;
    view.showAdd(allUserData, addedData);
    controller.addClick(userData, allUserData, addedData)
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
        let searchResult = await model.addMode(allUserData, userData, addData);
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
        model.loadHeadPhoto(userData.HeadPhoto);
        view.showFriend(userData.Friend, allUserData);
        controller.friendClick(allUserData.data, userData);
        loading.style.display = "none";
        const addResponse = await model.addData();
        const roomResponse = await model.getRooms();
        roomList = roomResponse.data;
        loading.style.display = "none";
        addData = addResponse.add;
        addedData = addResponse.added;
    },
    friendClick: function friendClick(){
        let friendList= document.querySelectorAll(".friend-list");
        for (let i=0; i<friendList.length; i++){
            friendList[i].addEventListener("click", (event)=>{
                let src = event.currentTarget.firstElementChild.src;
                let username = event.currentTarget.lastElementChild.textContent;
                view.showPopup();
                view.friendChat(src, username);
                const friendStartChat = document.getElementById("friendStartChat");
                const friendStartCall = document.getElementById("friendStartCall");
                const friendStartVideoCall = document.getElementById("friendStartVideoCall");
                friendStartChat.addEventListener("click", ()=>{
                    view.chatBox(src, username);
                    view.leavePopup();
                    view.showChat(userData, allUserData, roomList);
                    controller.enterChatRoom(username);
                    controller.chatClick();
                });
            });
        }
    },
    chatClick: function chatClick(){
        let chatList = document.querySelectorAll(".chat-list");
        for (let i=0; i<chatList.length; i++){
            chatList[i].addEventListener("click", (event)=>{
                let src = event.currentTarget.firstElementChild.src;
                let username = event.currentTarget.children[1].children[0].innerText;
                view.chatBox(src, username);
                controller.enterChatRoom(username);
            });
        }
    },
    addClick: function addClick(userData, allUserData, addedData){
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
    },

    enterChatRoom: async function enterChatRoom(username){
        const messageInput = document.getElementById("messageInput");
        const messageSend = document.getElementById("messageSend");
        const chatRoom = document.getElementById("chatRoom");
        const roomId = model.makeRoomId(username, userData, allUserData.data);
        await model.showMessage(roomId);

        let conn = new WebSocket("ws://" + document.location.host + "/ws/" + roomId);
        conn.onclose = function () {
            console.log("connection close")
        };
        conn.onmessage = function (evt) {
            let userInfo = evt.data.split("::?")[0];
            let messages = evt.data.split("::?")[1];
            let userInfoUser = userInfo.split(":?")[0];
            let time = userInfo.split(":?")[1];

            if (userData.Username === userInfoUser){
                view.myMessages(time, messages);
            }else{
                view.friendMessages(time, messages);
            }
            chatRoom.scrollTop = chatRoom.scrollHeight;
        };
        
        messageInput.addEventListener("change", ()=>{
            if (messageInput.value.trim() === ""){
                return false;
            }
            let timeNow = new Date();
            let timeMinutes = ("0" + timeNow.getMinutes()).slice(-2);
            let dateTime = timeNow.getHours() + ":" + timeMinutes; 
            const data = {
                "roomId": roomId,
                "content": messageInput.value,
                "sendTime": timeNow,
                "type": "string"
            }

            controller.updateRoomList(roomId, messageInput.value, timeNow, "string")
            view.showChat(userData, allUserData, roomList);
            controller.chatClick();
            conn.send(userData.Username+":?"+dateTime+"::?"+messageInput.value);
            model.sendMessage(data);
            messageInput.value = "";   
        
        });
    },
    updateRoomList: function updateRoomList(roomId, content, time, type){
        const found = roomList.findIndex(item => item.roomid === roomId)
        if (found !== -1){
            roomList[found].message[0].sendId = userData.ID
            roomList[found].message[0].content = content
            roomList[found].message[0].time = time
            roomList[found].message[0].type = type
        }else{
            roomList.push({
                "roomid": roomId,
                "message": [{
                    "content": content,
                    "sendId": userData.ID,
                    "time": time,
                    "type": type
                }]
            });
        }
    }
};
controller.init();