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

friendBtn.addEventListener("click", async ()=>{
    friendMode = true;
    chatMode = false;
    addMode = false;
    const allUserData = await model.allUser();
    view.showFriend(userData.Friend, allUserData);
    controller.friendClick(allUserData.data, userData);
});

chatBtn.addEventListener("click", async ()=>{
    friendMode = false;
    chatMode = true;
    addMode = false;
    const allUserData = await model.allUser();
    view.showChat(userData, allUserData, roomList);
    controller.chatClick(allUserData, userData);
});

addBtn.addEventListener("click", async ()=>{
    friendMode = false;
    chatMode = false;
    addMode = true;
    const allUserData = await model.allUser();
    view.showAdd(allUserData, addedData);
    controller.addClick(userData, allUserData, addedData)
});

searchInput.addEventListener("change", async ()=>{
    let auth = await model.refresh();
    if (!auth){
        return false;
    }
    const allUserData = await model.allUser();
    if (friendMode){
        const found = allUserData.data.findIndex(item => item.username === searchInput.value)
        if (found !== -1){
            view.searchFriend(allUserData.data[found]);
            controller.friendClick();
        }
    }else if(chatMode){
        let friendUsername = document.querySelectorAll(".friend-username");
        let friendImg = document.querySelectorAll(".friend-img");
        let lastMessage = document.querySelectorAll(".last-message");
        let unReadDiv = document.querySelectorAll(".unRead");
        let lastMessageTime = document.querySelectorAll(".last-message-time")
        let unRead;
        for (let i=0; i<friendUsername.length; i++){
            if (searchInput.value === friendUsername[i].innerText){
                if (unReadDiv[i] === undefined){
                    unRead = 0
                }else{
                    unRead = unReadDiv[i].textContent
                }
                view.searchChat(friendImg[i].currentSrc, friendUsername[i].innerText, lastMessage[i].innerText, unRead, lastMessageTime[i].innerText)
                controller.chatClick();
            }
        }
    }else if(addMode){
        if (searchInput.value === userData.Username){
            return false;
        }
        let searchResult = model.addMode(allUserData, userData, addData);
        if (searchResult){
            addFriendBtn = document.getElementById("addFriendBtn");
            addFriendBtn.addEventListener("click", async ()=>{
                const data = {"id": searchResult};
                let result = await model.addFriend(data);
                if (result){
                    view.addSent();
                    if (!addData){
                        addData = []
                    }
                    addData.push(searchResult);
                }
                
                const notification = {
                    "to": searchResult,
                    "type": "added",
                    "who": userData.ID
                }
                notifyConn.send(JSON.stringify(notification));
            });
        }
    }
    searchInput.value = "";
});

let controller = {
    init: async function(){
        await model.refresh();
        const allUserData = await model.allUser();
        userData = await model.getUserData();
        model.loadHeadPhoto(userData.HeadPhoto);
        view.showFriend(userData.Friend, allUserData);
        controller.friendClick(allUserData.data, userData);
        loading.style.display = "none";
        const addResponse = await model.addData();
        const roomResponse = await model.getRooms();
        roomList = roomResponse.data;
        if (!roomList){
            roomList = [];
        }
        loading.style.display = "none";
        addData = addResponse.add;
        addedData = addResponse.added;
        if (!addedData){
            addedData = [];
        }

        let addedCount = model.totalAdded();
        view.addRedTag(addedCount);

        let UnReadCount = model.totalUnRead();
        view.chatRedTag(UnReadCount);

        notifyConn = new WebSocket("wss://" + document.location.host + "/ws/notify");

        notifyConn.onopen = function (){
            return {"connection": true}
        }

        notifyConn.onclose = function () {
            return {"connection": false}
        };
        notifyConn.addEventListener("message", async()=>{
            const allUserData = await model.allUser();
            const notification = JSON.parse(event.data);
            if (notification.to !== userData.ID){
                return false;
            }
            if (notification.type === "message"){
                const found = roomList.findIndex(item => item.roomid === notification.roomId)
                let unRead = 0;
                const userId = userData.ID
                if (found !== -1){
                    unRead = roomList[found].unRead[userId]
                }
                if (!roomId || roomId !== notification.roomId){
                    unRead++;
                }else{
                    unRead = 0;
                    setTimeout(() =>{
                        const data = {
                            "roomId": notification.roomId
                        }
                        model.resetUnRead(data)
                    }, 3500)
                }
                controller.updateRoomList(notification.roomId, notification.content, notification.who, notification.sendTime, "string", unRead)
                if (chatMode){
                    view.showChat(userData, allUserData, roomList);
                    controller.chatClick();
                }
                chatTag.innerHTML = "";
                let UnReadCount = model.totalUnRead();
                view.chatRedTag(UnReadCount);
                
                if (roomId === notification.roomId){
                    const messageData = JSON.parse(event.data)
                    let username = messageData["username"]
                    let messages = messageData["content"]
                    let dateTime = new Date(messageData["sendTime"]);
                    let timeMinutes = ("0" + dateTime.getMinutes()).slice(-2);
                    let time = dateTime.getHours() + ":" + timeMinutes; 
                    
                    if (userData.Username !== username){
                        view.friendMessages(time, messages);
                    }
                    chatRoom.scrollTop = chatRoom.scrollHeight;        
                }
            }else if(notification.type === "added"){
                if (!addedData){
                    addedData = []
                }
                addedData.push(notification.who)
                if (addMode){
                    view.showAdd(allUserData, addedData);
                    controller.addClick(userData, allUserData, addedData)  
                }
                addTag.innerHTML = "";
                let addedCount = model.totalAdded();
                view.addRedTag(addedCount);                          
            }else if(notification.type === "add"){
                if (!userData.Friend){
                    userData.Friend = [notification.who];
                }else{
                    userData.Friend.push(notification.who);
                }
                if (friendMode){
                    view.showFriend(userData.Friend, allUserData);
                    controller.friendClick(allUserData.data, userData);                
                }
            }
        });
    },
    friendClick: async function friendClick (){
        const allUserData = await model.allUser();
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
    addClick: async function addClick(){
        const allUserData = await model.allUser();
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
                    let addStatus = await model.checkAdded(data)
                    if (!addStatus){
                        return false;
                    }
                    if (!userData.Friend){
                        userData.Friend = [addedData[addFriendList.length - i - 1]];
                    }else{
                        userData.Friend.push(addedData[addFriendList.length - i - 1]);
                    }
                    const notification = {
                        "to": addedData[addFriendList.length - i - 1],
                        "type": "add",
                        "who": userData.ID
                    }
                    notifyConn.send(JSON.stringify(notification));

                    const index = addedData.indexOf(addedData[addFriendList.length - i - 1]);
                    if (index > -1){
                        addedData.splice(index, 1);
                    }
                    view.leavePopup();
                    view.showAdd(allUserData, addedData);
                    controller.addClick(userData, allUserData, addedData);
                    addTag.innerHTML = "";
                    let addedCount = model.totalAdded();
                    view.addRedTag(addedCount);            
                });
            });
        };
    },

    enterChatRoom: async function enterChatRoom(username){
        const allUserData = await model.allUser();
        const messageInput = document.getElementById("messageInput");
        const messageSend = document.getElementById("messageSend");
        const chatRoom = document.getElementById("chatRoom");
        const friendId = model.makeRoomId(username, userData, allUserData.data)["friendId"];
        roomId = model.makeRoomId(username, userData, allUserData.data)["roomId"]; 
        await model.showMessage(roomId);
        chatRoom.scrollTop = chatRoom.scrollHeight;
        
        controller.resetUnRead(roomId);
        view.showChat(userData, allUserData, roomList);
        let unReadCount = model.totalUnRead();
        chatTag.innerHTML = "";
        view.chatRedTag(unReadCount);
        controller.chatClick(allUserData, userData); 
        const data = {
            "roomId": roomId
        } 
        model.resetUnRead(data)  

        messageInput.addEventListener("change", ()=>{
            if (messageInput.value.trim() === ""){
                return false;
            }
            let timeNow = new Date();
            let timeMinutes = ("0" + timeNow.getMinutes()).slice(-2);
            const sendTime = timeNow.getHours() + ":" + timeMinutes; 

            const data = {
                "roomId": roomId,
                "content": messageInput.value,
                "sendTime": timeNow,
                "type": "string",
            }
            const notification = {
                "to": friendId,
                "type": "message",
                "who": userData.ID,
                "roomId": roomId,
                "content": messageInput.value,
                "sendTime": timeNow,
            }
            console.log("click:", new Date())
            controller.updateRoomList(roomId, messageInput.value, userData.ID, timeNow, "string", 0)
            view.showChat(userData, allUserData, roomList);
            controller.chatClick();
            model.sendMessage(data);
            view.myMessages(sendTime, messageInput.value);
            notifyConn.send(JSON.stringify(notification));
            messageInput.value = "";   
            chatRoom.scrollTop = chatRoom.scrollHeight;
        });
    },
    updateRoomList: function updateRoomList(roomId, content, sendId, time, type, unRead){
        if (!roomList){
            roomList = []
        }
        const found = roomList.findIndex(item => item.roomid === roomId)
        const userId = userData.ID
        if (found !== -1){
            roomList[found].message[0].sendId = sendId
            roomList[found].message[0].content = content
            roomList[found].message[0].time = time
            roomList[found].message[0].type = type
            roomList[found].unRead[userId] = unRead
        }else{
            roomList.push({
                "roomid": roomId,
                "unRead":{[userId]: unRead},
                "message": [{
                    "content": content,
                    "sendId": sendId,
                    "time": time,
                    "type": type
                }]
            });
        }
    },
    createUUID: function createUUID(){
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },
    resetUnRead: function resetUnRead(roomId){
        const found = roomList.findIndex(item => item.roomid === roomId)
        if (found === -1){
            return false;
        }
        roomList[found].unRead[userData.ID] = 0;
    }
};
controller.init();