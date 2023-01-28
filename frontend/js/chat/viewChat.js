let view = {
    enterProfile: function enterProfile(){
        profileBox.style.display = "flex";
        backBlock.style.display = "block";
    },
    leaveCorner: function leaveCorner(){
        profileBox.style.display = "none";
        backBlock.style.display = "none";
    },
    headPhotoFresh: function headPhotoFresh(url){
        photoIcon.src = url;
        profileIcon.src = url;
    },
    showPopup: function showPopup(){
        popup.style.display = "flex";
    },
    leavePopup: function leavePopup(){
        popup.style.display = "none";
        popupContent.innerHTML = "";
    },
    showFriend: function showFriend(friendData, allUserData){
        friendBtn.style.backgroundColor = "#8d909d";
        chatBtn.style.backgroundColor = "#6A6C75";
        addBtn.style.backgroundColor = "#6A6C75";
        listContent.innerHTML = "";
        let friendHtml = ``;
        let src;
        if (!friendData){
            return false;
        }
        for (let i=0; i<friendData.length; i++){
            let id = friendData[friendData.length-i-1]
            for (let i=0; i<allUserData.data.length; i++){
                if (id === allUserData.data[i]._id){
                    let src = view.headPhotoSrc(allUserData.data[i]);
                    let username = allUserData.data[i].username;
                    let addedHtml =`
                        <div class="friend-list">
                            <img class="friend-img" src="${src}" alt=""/>
                            <div class="friend-username" >${username}</div>
                        </div>
                    `  
                    friendHtml = friendHtml + addedHtml
                }
            }
        }
        listContent.insertAdjacentHTML("afterbegin", friendHtml)
    },
    searchFriend: function searchFriend(data){
        listContent.innerHTML = "";
        const username = data.username;
        let src;
        if (data.headPhoto){
            src = data.headPhoto;
        }else{
            src = "/static/img/default_photo.png";
        }
        let searchFriendHtml =`
            <div class="friend-list">
                <img class="friend-img" src="${src}" alt=""/>
                <div class="friend-username" >${username}</div>
            </div>
        `  
        listContent.insertAdjacentHTML("afterbegin", searchFriendHtml)
    },
    showChat: function showChat(userData, allUserData, roomList){
        friendBtn.style.backgroundColor = "#6A6C75";
        chatBtn.style.backgroundColor = "#8d909d";
        addBtn.style.backgroundColor = "#6A6C75";
        listContent.innerHTML = "";
        for (let j=0; j<roomList.length; j++){
            let friendId;
            const idList = roomList[j].roomid.split(",")
            if (idList[0] === userData.ID){
                friendId = idList[1];
            }else{
                friendId = idList[0];
            }
            for (let i=0; i<allUserData.data.length; i++){
                if (friendId === allUserData.data[i]._id){
                    let src = view.headPhotoSrc(allUserData.data[i]);
                    let username = allUserData.data[i].username;
                    let messageContent;
                    let time = new Date(roomList[j].message[0].time);
                    let timeMinutes = ("0" + time.getMinutes()).slice(-2);
                    let dateTime = time.getHours() + ":" + timeMinutes; 
                    if (roomList[j].message[0].sendId === userData.ID){
                        messageContent = "You: " + roomList[j].message[0].content;
                    }else{
                        messageContent = roomList[j].message[0].content;
                    }
                    let chatHtml =`
                        <div class="chat-list">
                            <img class="friend-img" src="${src}" alt=""/>
                            <div class="last-message-box">
                                <div class="friend-username" >${username}</div>
                                <div class="last-message">${messageContent}</div>
                            </div>
                            <div class="last-message-time-box">
                                <div class="last-message-time">${dateTime}</div>  
                            </div>
                        </div>
                    `  
                    listContent.insertAdjacentHTML("afterbegin", chatHtml)
                }
            }
        }
    },
    showAdd: function showAdd(allUserData, addedData){
        friendBtn.style.backgroundColor = "#6A6C75";
        chatBtn.style.backgroundColor = "#6A6C75";
        addBtn.style.backgroundColor = "#8d909d";
        listContent.innerHTML = "";
        let showAddHtml = ``;
        if (!addedData){
            return false;
        }
        for (let i=0; i<addedData.length; i++){
            let id = addedData[addedData.length-i-1]
            for (let i=0; i<allUserData.data.length; i++){
                if (id === allUserData.data[i]._id){
                    let src = view.headPhotoSrc(allUserData.data[i]);
                    let username = allUserData.data[i].username;
                    let addedHtml =`
                        <div class="add-added-friend">
                            <img class="add-added-img" src="${src}" alt=""/>
                            <div class="add-added-username" >${username}</div>
                        </div>
                    `  
                    showAddHtml = showAddHtml + addedHtml
                }
            }
        }
        listContent.insertAdjacentHTML("afterbegin", showAddHtml);
    },
    headPhotoSrc: function headPhotoSrc(allUserData){    
        let src;        
        if (allUserData.headPhoto){
            src = allUserData.headPhoto;
        }else{
            src = "/static/img/default_photo.png";
        }
        return src;
    },
    showProfile: function showProfile(url){
        const profileHtml = `
            <input id="uploadPhoto" type="file" accept=".png, .jpg, .jpeg" hidden/>
            <div id="changePhoto" class="photo-div">
                <img id="changedImg" class="edit-profile-photo" src="/static/img/default_photo.png" alt=""/>
                <div class="change-photo-title">change photo</div>
            </div>
            <button id="saveProfile">save</button>
        `
        popupContent.insertAdjacentHTML("afterbegin", profileHtml);
        const changedImg = document.getElementById("changedImg");
        if (url.length > 10){
            changedImg.src = url;
        }
    },
    searchUser: function searchUser(data, addSent){
        let src;
        if (data.headPhoto === undefined){
            src = "/static/img/default_photo.png"
        }else{
            src = data.headPhoto
        }
        const username = data.username
        let showUserHtml = `
            <div id="userPhoto" class="photo-div">
                <img id="userImg" class="edit-profile-photo" src=${src} alt=""/>
            </div>
            <div class="search-username" >${username}</div>
        `
        if (addSent){
            let isTrue = `
                <div class="search-message">Already send add request</div>
            `
            showUserHtml = showUserHtml + isTrue;
        }else{
            let isFalse = `
                <button id="addFriendBtn" class="add-friend"><img class="addImg" src="/static/img/icon_add.png" alt=""/></button>
            `
            showUserHtml = showUserHtml + isFalse;
        }
        popupContent.insertAdjacentHTML("afterbegin", showUserHtml);
    },
    friendAlready: function friendAlready(data, addSent){
        let src;
        if (data.headPhoto === undefined){
            src = "/static/img/default_photo.png"
        }else{
            src = data.headPhoto
        }
        const username = data.username
        let showUserHtml = `
            <div id="userPhoto" class="photo-div">
                <img id="userImg" class="edit-profile-photo" src=${src} alt=""/>
            </div>
            <div class="search-username" >${username}</div>
            <div class="search-message">Friend already</div>
        `
        popupContent.insertAdjacentHTML("afterbegin", showUserHtml);
    },

    addSent: function addSent(){
        addFriendBtn.style.display = "none";
        const addSendedHtml = `
            <div class="search-message">Add sent. Wait for check</div>
        `
        popupContent.insertAdjacentHTML("beforeend", addSendedHtml);
    },
    checkAdd: function checkAdd(src, username){
        let showUserHtml = `
            <div id="userPhoto" class="photo-div">
                <img id="userImg" class="edit-profile-photo" src=${src} alt=""/>
            </div>
            <div class="search-username" >${username}</div>
            <button id="checkAddedBtn" class="add-friend"><img class="addImg" src="/static/img/icon_add.png" alt=""/></button>
        `
        popupContent.insertAdjacentHTML("afterbegin", showUserHtml);
    },
    friendChat: function friendChat(src, username){
        let showFriendHtml = `
            <div id="userPhoto" class="photo-div">
                <img id="userImg" class="edit-profile-photo" src=${src} alt=""/>
            </div>
            <div class="search-username" >${username}</div>
            <div class="friend-chat-btn-list">
                <button id="friendStartChat" class="add-friend"><img class="addImg" src="/static/img/icon_start_chat.png" alt=""/></button>
                <button id="friendStartCall" class="add-friend"><img class="addImg" src="/static/img/icon_call.png" alt=""/></button>
                <button id="friendStartVideoCall" class="add-friend"><img class="addImg" src="/static/img/icon_video_call.png" alt=""/></button>
            </div>
        `
        popupContent.insertAdjacentHTML("afterbegin", showFriendHtml);
    },
    chatBox: function chatBox(src, username){
        chatBoxContent.innerHTML = "";
        let chatBoxHtml = `
            <div class="chat-right-top">
                <img class="friend-img" src="${src}" alt=""/>
                <div class="chat-right-top-username">${username}</div>
            </div>
            <hr class="chatBox-split">
            <div id="chatRoom" class="chat-right-middle"></div>
            <hr class="chatBox-split">
            <div class="chat-right-bottom">
                <input id="messageInput" class="chat-right-bottom-input" placeholder="..." type="text"/>
                <div id="messageSend" class="chat-right-bottom-btn" ><img class="chat-right-bottom-btn-img" src="/static/img/icon_send.png" alt=""></div>
            </div>
        `
        chatBoxContent.insertAdjacentHTML("afterbegin", chatBoxHtml);
    },
    myMessages: function myMessages(time, messages){
        const messageHtml = `
            <div class="my-message-div">
                <div class="message-box">
                    <div class="time-and-content">
                        <div class="messages-time">${time}</div>
                        <div class="messages-myMessage">${messages}</div>
                    </div>
                </div>
            </div>
        `
        chatRoom.insertAdjacentHTML("beforeend", messageHtml);
    },
    friendMessages: function friendMessages(time, messages){
        const messageHtml = `
            <div class="friend-message-div">
                <div class="message-box">
                    <div class="time-and-content">
                        <div class="messages-friendMessage">${messages}</div>
                        <div class="messages-time">${time}</div>
                    </div>
                </div>
            </div>
        `
        chatRoom.insertAdjacentHTML("beforeend", messageHtml);
    }
}

export default view;