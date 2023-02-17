import model from "./modelChat.js";
import view from "./viewChat.js";


logout.addEventListener("click", ()=>{
    model.logout();
});

photoIcon.addEventListener("click", ()=>{
    view.enterProfile();
});

window.addEventListener("click", (event)=>{
    if (event.target === backBlock){
        view.leaveCorner();
    }
    if (event.target === PhotoDiv){
        PhotoDiv.style.display = "none";
        Photo.src = "";
    }
    if (emojiState){
        if (event.target === backBlock){
            emojiDiv.style.display = "none"
            emojiDiv.innerHTML = ""
            emojiState = false;
            messageInput.style.zIndex = "1";
        }
    }
    if (DemoInput){
        if (event.target === backBlock){
            recordDiv.style.display = "none";
            recordDiv.innerHTML = "";
            DemoInput = false;
            messageInput.style.zIndex = "1";
        }
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
    view.showFriend(userData.Friend);
    controller.friendClick();
});

chatBtn.addEventListener("click", async ()=>{
    friendMode = false;
    chatMode = true;
    addMode = false;
    view.showChat(userData, roomList);
    controller.chatClick();
});

addBtn.addEventListener("click", async ()=>{
    friendMode = false;
    chatMode = false;
    addMode = true;
    view.showAdd(addedData);
    controller.addClick(userData, addedData)
});

searchInput.addEventListener("change", async ()=>{
    if (friendMode){
        const found = userData.Friend.findIndex(item => item.username === searchInput.value)
        if (found !== -1){
            view.searchFriend(userData.Friend[found]);
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
        const data = {
            "searchId": searchInput.value
        }
        const found = userData.Friend.findIndex(item => item.username === searchInput.value)
        if (found !== -1){
            view.showPopup();
            view.friendAlready(userData.Friend[found]);
            return false;
        }
        let searchResult = await model.addMode(data);
        if (searchResult){
            addZone = document.getElementById("addZone");
            const introduction = document.getElementById("introduction");
            const addFriendBtn = document.getElementById("addFriendBtn");
            addFriendBtn.addEventListener("click", async ()=>{
                const data = {"id": searchResult._id, "introduction": introduction.value};
                let result = await model.addFriend(data);
                if (result){
                    view.addSent();
                    if (!addData){
                        addData = []
                    }
                    addData.push(searchResult);
                }
                let headPhoto;
                if (!userData.HeadPhoto){
                    headPhoto = null;
                }else{
                    headPhoto = userData.HeadPhoto
                }
                const myData = {
                    "_id": userData.ID,
                    "username": userData.Username,
                    "headPhoto": headPhoto,
                    "introduction": introduction.value
                }
                const notification = {
                    "to": searchResult._id,
                    "type": "added",
                    "who": userData.ID,
                    "data": myData
                }
                notifyConn.send(JSON.stringify(notification));
            });
        }
    }
    searchInput.value = "";
});
window.addEventListener("click", (event)=>{
    if (notifyConn.readyState === 3){
        notifyConn = new WebSocket("wss://" + document.location.host + "/ws/notify");
    }
})

let controller = {
    init: async function(){
        await model.refresh();
        userData = await model.getUserData();
        model.loadHeadPhoto(userData.HeadPhoto);
        if (!userData.Friend){
            userData.Friend = []
        }
        view.showFriend(userData.Friend);
        controller.friendClick();
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
        loading.style.display = "none";

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
        }
        notifyConn.addEventListener("message", async(event)=>{
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
                if (notification.messageType === "string"){
                    controller.updateRoomList(notification.roomId, notification.content, notification.who, notification.sendTime, "string", unRead)
                } else {
                    controller.updateRoomList(notification.roomId, notification.messageType, notification.who, notification.sendTime, notification.messageType, unRead)
                }
                if (chatMode){
                    view.showChat(userData, roomList);
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
                        view.friendMessages(time, messages, notification.messageType);
                        controller.ViewPhoto();
                        setTimeout(()=>{
                            chatRoom.scrollTop = chatRoom.scrollHeight;
                        }, 1000)                
                    }
                    chatRoom.scrollTop = chatRoom.scrollHeight;        
                }
            }else if(notification.type === "added"){
                if (!addedData){
                    addedData = []
                }
                addedData.push(notification.data)
                if (addMode){
                    view.showAdd(addedData);
                    controller.addClick()  
                }
                addTag.innerHTML = "";
                let addedCount = model.totalAdded();
                view.addRedTag(addedCount);   
            }else if(notification.type === "add"){
                if (!userData.Friend){
                    userData.Friend = [notification.data];
                }else{
                    userData.Friend.push(notification.data);
                }
                if (friendMode){
                    view.showFriend(userData.Friend);
                    controller.friendClick();                
                }
            }else if(notification.type === "call"){
                calling = true;
                const found = userData.Friend.findIndex(item => item._id === notification.who)
                if (found !== -1){
                    let src;
                    let username = userData.Friend[found].username
                    if (!userData.Friend[found].headPhoto){
                        src = "/static/img/default_photo.png";
                    }else{
                        src = userData.Friend[found].headPhoto;
                    }
                    view.showPopup();
                    view.friendCall(src, username)  
                    const callCatch = document.getElementById("callCatch");
                    const callDrop = document.getElementById("callDrop");
                    callCatch.addEventListener("click", ()=>{
                        let config;
                        const url = "/room/" + notification.uuid;
                        const pickup = {
                            "to": notification.who,
                            "type": "callCatch",
                            "who": userData.ID,
                            "url": url
                        }
                        notifyConn.send(JSON.stringify(pickup))
                        window.open(url, "call", config="height=900, width=1200");
                        view.leavePopup();
                        calling = false;    
                    });
                    callDrop.addEventListener("click", ()=>{
                        const drop = {
                            "to": notification.who,
                            "type": "dropCall",
                            "who": userData.ID,
                        }
                        notifyConn.send(JSON.stringify(drop));
                        view.leavePopup();
                        calling = false;    
                    });
                    leaveBtn.addEventListener("click", ()=>{
                        if (calling){
                            const drop = {
                                "to": notification.who,
                                "type": "dropCall",
                                "who": userData.ID,
                            }
                            notifyConn.send(JSON.stringify(drop));
                            calling = false;    
                        }
                    });      
                }         
            }else if(notification.type === "callCatch"){
                let config;
                window.open(notification.url, "call", config="height=900, width=1200");
                view.leavePopup();
                calling = false;
            }else if(notification.type === "dropCall"){
                if(!calling){
                    return 
                }
                view.callDropped();
                calling = false;
            }else if(notification.type === "cancelCall"){
                view.leavePopup();
                calling = false;
            }
        });
    },
    friendClick: async function friendClick (){
        const service = document.getElementById("service");
        service.addEventListener("click", ()=>{
            view.showPopup();
            view.serviceChat();
            const startServiceChat = document.getElementById("startServiceChat");
            startServiceChat.addEventListener("click", ()=>{
                view.serviceChatBox();
                view.leavePopup();
                view.showChat(userData, roomList);
                controller.chatClick();
                controller.enterDemoRoom();
            })
        })
        let friendList= document.querySelectorAll(".friend-list");
        for (let i=0; i<friendList.length; i++){
            friendList[i].addEventListener("click", (event)=>{
                let friendId;
                let src = event.currentTarget.firstElementChild.src;
                let username = event.currentTarget.lastElementChild.textContent;
                const found = userData.Friend.findIndex(item => item.username === username)
                if (found !== -1){
                    friendId = userData.Friend[found]._id
                }
                view.showPopup();
                view.friendChat(src, username);
                const friendStartChat = document.getElementById("friendStartChat");
                const friendStartCall = document.getElementById("friendStartCall");
                friendStartChat.addEventListener("click", ()=>{
                    view.chatBox(src, username);
                    view.leavePopup();
                    view.showChat(userData, roomList);
                    controller.enterChatRoom(username);
                    controller.chatClick();
                });
                friendStartCall.addEventListener("click", ()=>{
                    controller.Call(friendId);
                });
            });
        }
    },
    chatClick: function chatClick(){
        const service = document.getElementById("service");
        service.addEventListener("click", ()=>{
            view.serviceChatBox();
            view.leavePopup();
            view.showChat(userData, roomList);
            controller.chatClick();
            controller.enterDemoRoom();
        })
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
        let addFriendList = document.querySelectorAll(".add-added-friend");
        for (let i=0; i<addFriendList.length; i++){
            addFriendList[i].addEventListener("click", async (event)=>{
                view.showPopup();
                view.checkAdd(addedData[i].headPhoto, addedData[i].username, addedData[i].introduction);
                const checkAddedBtn = document.getElementById("checkAddedBtn");
                const data = {
                    "id": addedData[i]._id
                }
                checkAddedBtn.addEventListener("click", async ()=>{
                    let addStatus = await model.checkAdded(data)
                    if (!addStatus){
                        return false;
                    }
                    if (!userData.Friend){
                        userData.Friend = [addedData[i]];
                    }else{
                        userData.Friend.push(addedData[i]);
                    }
                    let headPhoto;
                    if (!userData.HeadPhoto){
                        headPhoto = null;
                    }else{
                        headPhoto = userData.HeadPhoto
                    }
                    const myData = {
                        "_id": userData.ID,
                        "username": userData.Username,
                        "headPhoto": headPhoto
                    }
                    const notification = {
                        "to": addedData[i]._id,
                        "type": "add",
                        "who": userData.ID,
                        "data": myData
                    }
                    notifyConn.send(JSON.stringify(notification));

                    addedData.splice(i, 1);
                    
                    view.leavePopup();
                    view.showAdd(addedData);
                    controller.addClick(userData, addedData);
                    addTag.innerHTML = "";
                    let addedCount = model.totalAdded();
                    view.addRedTag(addedCount);            
                });
            });
        };
    },
    enterChatRoom: async function enterChatRoom(username){
        const messageInput = document.getElementById("messageInput");
        const messageSend = document.getElementById("messageSend");
        const chatRoom = document.getElementById("chatRoom");
        const chatBoxCall = document.getElementById("chatBoxCall");
        const friendId = model.makeRoomId(username, userData)["friendId"];
        const fileInput = document.getElementById("fileInput");
        const sendPhotoOrFile = document.getElementById("sendPhotoOrFile");
        const photoPreview = document.getElementById("photoPreview");
        const filePreview = document.getElementById("filePreview");
        const previewDiv = document.getElementById("previewDiv");
        const cancelPreview = document.getElementById("cancelPreview");
        const emoji = document.getElementById("emoji");
        const emojiDiv = document.getElementById("emojiDiv");
        const audioRecord = document.getElementById("audioRecord");
        const recordDiv = document.getElementById("recordDiv");
        roomId = model.makeRoomId(username, userData)["roomId"]; 

        await model.showMessage(roomId);
        chatRoom.scrollTop = chatRoom.scrollHeight;

        controller.ViewPhoto();
        
        controller.resetUnRead(roomId);
        view.showChat(userData, roomList);
        let unReadCount = model.totalUnRead();
        chatTag.innerHTML = "";
        view.chatRedTag(unReadCount);
        controller.chatClick(); 
        const data = {
            "roomId": roomId
        } 
        model.resetUnRead(data)  
    
        messageInput.addEventListener("keypress", async (event)=>{
            if (event.key !== "Enter"){
                return
            }
            controller.message(messageInput, roomId, friendId, fileInput, blob);
            controller.ViewPhoto();
        });
        messageSend.addEventListener("click", ()=>{
            controller.message(messageInput, roomId, friendId, fileInput, blob);
            controller.ViewPhoto();
        })
        chatBoxCall.addEventListener("click", ()=>{
            const found = userData.Friend.findIndex(item => item._id === friendId)
            let src;
            let username;
            if (found !== -1){
                src = userData.Friend[found].headPhoto;
                username = userData.Friend[found].username;
            }
            view.showPopup();
            view.friendChat(src, username);
            controller.Call(friendId);
        });
        sendPhotoOrFile.addEventListener("click", ()=>{
            fileInput.click();
        });
        fileInput.addEventListener("change", (event)=>{
            const file = event.target.files[0];
            if (file.size > 10000000){
                fileInput.value = "";
                return
            }
            if (file.type.split("/")[0] === "application"){
                previewDiv.style.display = "flex";
                let fileName = file.name;
                filePreview.textContent = fileName;
            }else if (file.type.split("/")[0] === "image"){
                previewDiv.style.display = "flex";
                let src = URL.createObjectURL(file);
                photoPreview.src = src;
            }else{
                fileInput.value = "";
            }
        });
        cancelPreview.addEventListener("click", ()=>{
            previewDiv.style.display = "none";
            photoPreview.src = "";
            fileInput.value = "";
            filePreview.textContent = "";
        });
        emoji.addEventListener("click", ()=>{
            backBlock.style.display = "block";
            emojiDiv.style.display = "flex";
            messageInput.style.zIndex = "10";
            view.emoji();
            emojiState = true;

            let emojis = document.querySelectorAll(".emojis");
            for (let i=0; i<emojis.length; i++){
                emojis[i].addEventListener("click", async ()=>{
                    messageInput.value += emojis[i].textContent
                });
            }
        });
        audioRecord.addEventListener("click", ()=>{
            view.recordBox();
            recordDiv.style.display = "flex";
            const record = document.getElementById("record");
            const recordImg = document.getElementById("recordImg");
            const cancelRecord = document.getElementById("cancelRecord");
            const recordBar = document.getElementById("recordBar");
            let recording = false;
            let count;
            let mediaRecorder, chunks = [], audioURL = ''
            if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia){            
                navigator.mediaDevices.getUserMedia({
                    audio: true
                }).then(stream => {
                    audioStream = stream
                    mediaRecorder = new MediaRecorder(stream)
            
                    mediaRecorder.ondataavailable = (e) => {
                        chunks.push(e.data)
                    }

                    mediaRecorder.onstop = () => {
                        blob = new Blob(chunks, {'type': 'audio/webm'})
                        chunks = []
                        audioURL = window.URL.createObjectURL(blob)
                        document.getElementById("audioResult").src = audioURL
                    }
                }).catch(error => {
                    console.log(error)
                })
            }else{
                recordBar = ""
                recordBar = "No audio device"
            }
            record.addEventListener("click", ()=>{
                if (!recording){
                    view.recordCount();
                    const recordTime = document.getElementById("recordTime");
                    recording = true;
                    recordImg.src = "/static/img/icon_pause.png";
                    mediaRecorder.start()
                    count = setInterval(()=>{
                        let second = parseInt(recordTime.textContent);
                        second --;
                        recordTime.textContent = second;
                        if (second === 0){
                            clearInterval(count)
                            recording = false;
                            recordImg.src = "/static/img/icon_play.png";        
                            recordTime.textContent = 30;
                            view.audio();
                            mediaRecorder.stop()
                        }
                    }, 1000)
                }else{
                    recording = false;
                    mediaRecorder.stop()
                    recordImg.src = "/static/img/icon_play.png";
                    clearInterval(count)
                    view.audio();
                }
            });
            cancelRecord.addEventListener("click", ()=>{
                recordDiv.style.display = "none";
                recordDiv.innerHTML = ""
                recording = false;
                audioStream.getTracks().forEach(function(track) {
                    track.stop();
                });
            });
        });
    },
    message: function(messageInput, roomId, friendId, fileInput, audioFile){
        if (messageInput.value.trim() === "" && !fileInput.value && !audioFile){
            return
        }
        let timeNow = new Date();
        if (messageInput.value.trim() !== ""){
            controller.updateRoomList(roomId, messageInput.value, userData.ID, timeNow, "string", 0)
            model.messageFileSend(messageInput.value, "message", "string", friendId);
            chatRoom.scrollTop = chatRoom.scrollHeight;    
        }
        if (fileInput.value){
            const fileName = controller.createUUID();
            const file = fileInput.files[0];
            if (fileInput.files[0].type.split("/")[0] === "image"){
                model.messageFileSend(file, fileName, "image", friendId);
                controller.updateRoomList(roomId, "image", userData.ID, timeNow, "image", 0);
                setTimeout(()=>{
                    controller.ViewPhoto();
                }, 1000)
            }else if(fileInput.files[0].type.split("/")[0] === "application"){
                model.messageFileSend(file, fileName, "file", friendId);
                controller.updateRoomList(roomId, "file", userData.ID, timeNow, "file", 0)
            }
            previewDiv.style.display = "none";
            photoPreview.src = "";
            fileInput.value = "";
            filePreview.textContent = "";
        }
        if (audioFile) {
            const fileName = controller.createUUID();
            const file = audioFile;
            model.messageFileSend(file, fileName, "audio", friendId);
            controller.updateRoomList(roomId, "audio", userData.ID, timeNow, "audio", 0)
            blob = null;
            recordDiv.style.display = "none";
            recordDiv.innerHTML = ""
            if (audioStream){
                audioStream.getTracks().forEach(function(track) {
                    track.stop();
                });
            }
        }
        if (emojiState){
            emojiDiv.style.display = "none"
            emojiDiv.innerHTML = ""
            emojiState = false;
        }
        view.showChat(userData, roomList);
        controller.chatClick();
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
    },
    getUserMedia: function(){
        navigator.mediaDevices.getUserMedia({video: true, audio: true}, (stream)=>{
            stream.getVideoTracks().forEach(function(track) {
                track.stop();
            });
        });
    },
    Call: function(friendId){
        const uuid = controller.createUUID();
        const notification = {
            "to": friendId,
            "type": "call",
            "who": userData.ID,
            "uuid": uuid
        }        
        notifyConn.send(JSON.stringify(notification))
        calling = true
        view.callWait();

        leaveBtn.addEventListener("click", ()=>{
            if (calling){
                const cancel = {
                    "to": friendId,
                    "type": "cancelCall",
                    "who": userData.ID,
                }
                notifyConn.send(JSON.stringify(cancel)); 
                calling = false;   
            }
        }); 
        setTimeout(()=>{
            if (calling){
                const cancel = {
                    "to": friendId,
                    "type": "cancelCall",
                    "who": userData.ID,
                }
                notifyConn.send(JSON.stringify(cancel)); 
                calling = false;   
                view.callNoResponse();
            }
        }, 30000)
    },
    notification: function(webNotificationTitle, webNotificationContent){
        Notification.requestPermission().then(perm => {
            if (perm === "granted"){
                new Notification(
                    webNotificationTitle,
                    {
                        body: webNotificationContent,
                        tag: "notification"
                    }
                )
                console.log("good!")
            }
        })
    },
    enterDemoRoom: async function enterChatRoom(){
        const messageInput = document.getElementById("messageInput");
        const messageSend = document.getElementById("messageSend");
        const fileInput = document.getElementById("fileInput");
        const sendPhotoOrFile = document.getElementById("sendPhotoOrFile");
        const photoPreview = document.getElementById("photoPreview");
        const filePreview = document.getElementById("filePreview");
        const previewDiv = document.getElementById("previewDiv");
        const cancelPreview = document.getElementById("cancelPreview");
        const emoji = document.getElementById("emoji");
        const emojiDiv = document.getElementById("emojiDiv");
        const audioRecord = document.getElementById("audioRecord");
        const recordDiv = document.getElementById("recordDiv");
        const chatRoom = document.getElementById("chatRoom");
        roomId = userData.ID + ",Demo"

        await model.showMessage(roomId);
        chatRoom.scrollTop = chatRoom.scrollHeight;

        controller.ViewPhoto();

        messageInput.addEventListener("click", ()=>{
            if (!recordState){
                backBlock.style.display = "block";
                recordDiv.style.display = "flex";
                messageInput.style.zIndex = "10";
                view.showSelection();
                DemoInput = true
    
                let selections = document.querySelectorAll(".selection");
                for (let i=0; i<selections.length; i++){
                    selections[i].addEventListener("click",()=>{
                        messageInput.value = selections[i].textContent;
                        controller.DemoMessage(roomId, messageInput, fileInput, blob);    
                    });
                }
            }
        });
        messageInput.addEventListener("keypress", async (event)=>{
            if (event.key !== "Enter"){
                return
            }
            controller.DemoMessage(roomId, messageInput, fileInput, blob);
            controller.ViewPhoto();
            messageInput.style.zIndex = "1";
        });
        messageSend.addEventListener("click", ()=>{
            controller.DemoMessage(roomId, messageInput, fileInput, blob);
            controller.ViewPhoto();
            messageInput.style.zIndex = "1";
        })
        sendPhotoOrFile.addEventListener("click", ()=>{
            fileInput.click();
        });
        fileInput.addEventListener("change", (event)=>{
            const file = event.target.files[0];
            if (file.size > 10000000){
                fileInput.value = "";
                return
            }
            if (file.type.split("/")[0] === "application"){
                previewDiv.style.display = "flex";
                let fileName = file.name;
                filePreview.textContent = fileName;
            }else if (file.type.split("/")[0] === "image"){
                previewDiv.style.display = "flex";
                let src = URL.createObjectURL(file);
                photoPreview.src = src;
            }else{
                fileInput.value = "";
            }
        });
        cancelPreview.addEventListener("click", ()=>{
            previewDiv.style.display = "none";
            photoPreview.src = "";
            fileInput.value = "";
            filePreview.textContent = "";
        });
        emoji.addEventListener("click", ()=>{
            backBlock.style.display = "block";
            emojiDiv.style.display = "flex";
            messageInput.style.zIndex = "10";
            view.emoji();
            emojiState = true;

            let emojis = document.querySelectorAll(".emojis");
            for (let i=0; i<emojis.length; i++){
                emojis[i].addEventListener("click", async ()=>{
                    messageInput.value += emojis[i].textContent
                });
            }
        });
        audioRecord.addEventListener("click", ()=>{
            recordState = true;
            view.recordBox();
            recordDiv.style.display = "flex";
            const record = document.getElementById("record");
            const recordImg = document.getElementById("recordImg");
            const cancelRecord = document.getElementById("cancelRecord");
            const recordBar = document.getElementById("recordBar");
            let recording = false;
            let count;
            let mediaRecorder, chunks = [], audioURL = ''
            if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia){            
                navigator.mediaDevices.getUserMedia({
                    audio: true
                }).then(stream => {
                    audioStream = stream
                    mediaRecorder = new MediaRecorder(stream)
            
                    mediaRecorder.ondataavailable = (e) => {
                        chunks.push(e.data)
                    }

                    mediaRecorder.onstop = () => {
                        blob = new Blob(chunks, {'type': 'audio/webm'})
                        chunks = []
                        audioURL = window.URL.createObjectURL(blob)
                        document.getElementById("audioResult").src = audioURL
                    }
                }).catch(error => {
                    console.log(error)
                })
            }else{
                recordBar = ""
                recordBar = "No audio device"
            }
            record.addEventListener("click", ()=>{
                if (!recording){
                    view.recordCount();
                    const recordTime = document.getElementById("recordTime");
                    recording = true;
                    recordImg.src = "/static/img/icon_pause.png";
                    mediaRecorder.start()
                    count = setInterval(()=>{
                        let second = parseInt(recordTime.textContent);
                        second --;
                        recordTime.textContent = second;
                        if (second === 0){
                            clearInterval(count)
                            recording = false;
                            recordImg.src = "/static/img/icon_play.png";        
                            recordTime.textContent = 30;
                            view.audio();
                            mediaRecorder.stop()
                        }
                    }, 1000)
                }else{
                    recording = false;
                    mediaRecorder.stop()
                    recordImg.src = "/static/img/icon_play.png";
                    clearInterval(count)
                    view.audio();
                }
            });
            cancelRecord.addEventListener("click", ()=>{
                recordDiv.style.display = "none";
                recordDiv.innerHTML = ""
                recording = false;
                recordState = false;
                audioStream.getTracks().forEach(function(track) {
                    track.stop();
                });
            });
        });
    },
    DemoMessage: async function(roomId, messageInput, fileInput, audioFile){
        if (messageInput.value.trim() === "" && !fileInput.value && !audioFile){
            return
        }
        if (messageInput.value.trim() !== ""){
            model.demoMessageFileSend(roomId, messageInput.value, "string", "string");
            let timeNow = new Date();
            let timeMinutes = ("0" + timeNow.getMinutes()).slice(-2);
            const sendTime = timeNow.getHours() + ":" + timeMinutes;     
            if (messageInput.value === "How to start?"){
                view.friendMessages(sendTime, "/static/img/Demo-Add.gif", "image")
                view.friendMessages(sendTime, "Search user ID at add page and click add button", "string")
                view.friendMessages(sendTime, "Don't forget to introduce yourself", "string")
                const friendRecommend = await model.friendRecommend();
                view.friendMessages(sendTime, "Did you recognize them?", "string")
                for (let i=0; i<3; i++){
                    view.friendMessages(sendTime, friendRecommend.data[i], "recommend")
                }
            }else if(messageInput.value === "How to call"){
                view.friendMessages(sendTime, "/static/img/video_chat.gif", "image")
            }    
            controller.ViewPhoto();
            messageInput.value = "";   
            chatRoom.scrollTop = chatRoom.scrollHeight;    
        }
        if (fileInput.value){
            const fileName = controller.createUUID();
            const file = fileInput.files[0];
            if (fileInput.files[0].type.split("/")[0] === "image"){
                model.demoMessageFileSend(roomId, file, fileName, "image");
            }else if(fileInput.files[0].type.split("/")[0] === "application"){
                model.demoMessageFileSend(roomId, file, fileName, "file");
            }
            previewDiv.style.display = "none";
            photoPreview.src = "";
            fileInput.value = "";
            filePreview.textContent = "";
            setTimeout(()=>{
                controller.ViewPhoto();
            }, 1000)
        }
        if (audioFile) {
            const fileName = controller.createUUID();
            const file = audioFile;
            model.demoMessageFileSend(roomId, file, fileName, "audio");
            blob = null;
            recordDiv.style.display = "none";
            recordDiv.innerHTML = ""
            if (audioStream){
                audioStream.getTracks().forEach(function(track) {
                    track.stop();
                });
            }
        }
        if (emojiState){
            emojiDiv.style.display = "none";
            emojiDiv.innerHTML = "";
            emojiState = false;
            backBlock.style.display = "none";
        }
        if (DemoInput){
            recordDiv.style.display = "none";
            recordDiv.innerHTML = "";
            DemoInput = false;
            backBlock.style.display = "none";
        }
    },
    ViewPhoto: function(){
        photoReview = document.querySelectorAll(".messages-myPhoto");
        for (let i=0; i<photoReview.length; i++){
            photoReview[i].addEventListener("click", ()=>{
                PhotoDiv.style.display = "flex";
                Photo.src = photoReview[i].currentSrc;
                console.log("test")
            })
        }
    }
};
controller.init();