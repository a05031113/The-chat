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
    showFriend: function showFriend(friendData){
        friendBtn.style.backgroundColor = "#8d909d";
        chatBtn.style.backgroundColor = "#6A6C75";
        addBtn.style.backgroundColor = "#6A6C75";
        listContent.innerHTML = "";
        let friendHtml = ``
        if (!friendData){
            return false;
        }
        for (let i=0; i<friendData.length; i++){
            let src = view.headPhotoSrc(friendData[i].headPhoto);
            let username = friendData[i].username;
            let addedHtml =`
                <div class="friend-list">
                    <img class="friend-img" src="${src}" alt=""/>
                    <div class="friend-username" >${username}</div>
                </div>
            `  
            friendHtml = friendHtml + addedHtml
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
    showChat: function showChat(userData, roomList){
        friendBtn.style.backgroundColor = "#6A6C75";
        chatBtn.style.backgroundColor = "#8d909d";
        addBtn.style.backgroundColor = "#6A6C75";
        listContent.innerHTML = "";
        if (!roomList){
            return false;
        }
        let sortRoomList = roomList.sort(function(a,b){
            return a.message[0].time > b.message[0].time ? 1:-1;
        });
        for (let j=0; j<sortRoomList.length; j++){
            let friendId;
            const idList = sortRoomList[j].roomid.split(",")
            if (idList[0] === userData.ID){
                friendId = idList[1];
            }else{
                friendId = idList[0];
            }
            const found = userData.Friend.findIndex(item => item._id === friendId)
            if (found !== -1){
                let src = view.headPhotoSrc(userData.Friend[found].headPhoto);
                let username = userData.Friend[found].username;
                let messageContent;
                let time = new Date(sortRoomList[j].message[0].time);
                let timeMinutes = ("0" + time.getMinutes()).slice(-2);
                let dateTime = (time.getMonth() + 1) + "/" + time.getDate() + " " + time.getHours() + ":" + timeMinutes; 
                let unRead = sortRoomList[j].unRead[userData.ID]
                if (sortRoomList[j].message[0].sendId === userData.ID){
                    messageContent = "You: ";
                }else{
                    messageContent = "";
                }
                if (sortRoomList[j].message[0].type === "string"){
                    if (/<|>/.test(sortRoomList[j].message[0].content)){
                    }else{
                        messageContent = messageContent + sortRoomList[j].message[0].content;
                    }    
                }else if (sortRoomList[j].message[0].type === "image"){
                    messageContent = messageContent + "image";
                }else if (sortRoomList[j].message[0].type === "file"){
                    messageContent = messageContent + "file";
                }else if (sortRoomList[j].message[0].type === "audio"){
                    messageContent = messageContent + "audio";
                }
                function unReadDiv(unRead){
                    let unReadHtml;
                    if (unRead === 0 || unRead === undefined){
                        unReadHtml = ``
                    }else{
                        unReadHtml = `<div class="unRead">${unRead}</div>`
                    }
                    return unReadHtml
                }
                let chatHtml =`
                    <div class="chat-list">
                        <img class="friend-img" src="${src}" alt=""/>
                        <div class="last-message-box">
                            <div class="friend-username" >${username}</div>
                            <div class="last-message">${messageContent}</div>
                        </div>
                        <div class="last-message-time-box">
                            ${unReadDiv(unRead)}
                            <div class="last-message-time">${dateTime}</div>  
                        </div>
                    </div>
                `  
                listContent.insertAdjacentHTML("afterbegin", chatHtml)
                if (sortRoomList[j].message[0].type === "string" && /<|>/.test(sortRoomList[j].message[0].content)){
                    const allMessages = document.querySelector(".last-message");
                    const message = messageContent + sortRoomList[j].message[0].content
                    allMessages.textContent = message;
                }
            }
        }
    },
    searchChat: function searchChat(src, username, messageContent, unRead, dateTime){
        listContent.innerHTML = "";
        function unReadDiv(unRead){
            let unReadHtml;
            if (unRead === 0 || unRead === undefined){
                unReadHtml = ``
            }else{
                unReadHtml = `<div class="unRead">${unRead}</div>`
            }
            return unReadHtml
        }
        let searchChatHtml =`
            <div class="chat-list">
                <img class="friend-img" src="${src}" alt=""/>
                <div class="last-message-box">
                    <div class="friend-username" >${username}</div>
                    <div class="last-message">${messageContent}</div>
                </div>
                <div class="last-message-time-box">
                    ${unReadDiv(unRead)}
                    <div class="last-message-time">${dateTime}</div>  
                </div>
            </div>        
        `  
        listContent.insertAdjacentHTML("afterbegin", searchChatHtml)
    },
    showAdd: function showAdd(addedData){
        friendBtn.style.backgroundColor = "#6A6C75";
        chatBtn.style.backgroundColor = "#6A6C75";
        addBtn.style.backgroundColor = "#8d909d";
        listContent.innerHTML = "";
        let showAddHtml = ``;
        if (!addedData){
            return false;
        }
        for (let i=0; i<addedData.length; i++){
            let src = view.headPhotoSrc(addedData[i].headPhoto);
            let username = addedData[i].username;
            let introduction = addedData[i].introduction;
            if (!introduction){
                introduction = ""
            }
            let addedHtml =`
                <div class="add-added-friend">
                    <img class="add-added-img" src="${src}" alt=""/>
                    <div>
                        <div class="add-added-username">${username}</div>
                        <div class="added-introduction">${introduction}</div>
                    </div>
                </div>
            `  
            showAddHtml = showAddHtml + addedHtml
        }
        listContent.insertAdjacentHTML("afterbegin", showAddHtml);
    },
    headPhotoSrc: function headPhotoSrc(headPhoto){    
        let src;        
        if (headPhoto){
            src = headPhoto;
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
            <div class="profileItems">
                <div class="profileItem">
                    <div class="itemTitle">username: </div>
                    <div id="editInputUsername" class="itemContent">${userData.Username}</div>
                    <div id="editUsername" class="edit">edit</div>
                </div>
                <div class="profileItem">
                    <div class="itemTitle">email: </div>
                    <div id="editInputEmail" class="itemContent">${userData.Email}</div>
                    <div id="editEmail" class="edit">edit</div>
                </div>
                <div class="profile-button-zone">
                    <div class="profile-button-div">
                        <button class="profile-button" id="saveProfile">save</button>
                    </div >
                    <div class="profile-button-div">
                        <button class="profile-button" id="changePassword">Change Password</button>
                    </div>
                </div>
            </div>
            <div id="changeError" class="changeError"></div>
        `
        popupContent.insertAdjacentHTML("afterbegin", profileHtml);
        const changedImg = document.getElementById("changedImg");
        if (url.length > 10){
            changedImg.src = url;
        }
    },
    changePasswordZone: function(){
        const passwordHtml = `
            <div class="profileItem">
                <input id="currentPassword" class="UsernameInput" placeholder="current password" type="password"/>            
            </div>
            <div class="profileItem">
                <input id="newPassword" class="UsernameInput" placeholder="new password" type="password"/>            
            </div>
            <div class="profileItem">
                <input id="confirmation" class="UsernameInput" placeholder="confirmation" type="password"/>            
            </div>
            <div class="password-notice">Password needs at least 8 items with numbers, upper and lower case</div>
        `
        document.querySelectorAll(".profile-button-div")[1].insertAdjacentHTML("afterbegin", passwordHtml);
    },
    searchUser: function searchUser(data, addSent){
        let src;
        if (data.headPhoto === undefined || data.headPhoto === ""){
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
                <div id="addZone" class="addZone">
                    <input id="introduction" class="introduction" type="textarea" placeholder="introduce..."/>
                    <button id="addFriendBtn" class="add-friend"><img class="addImg" src="/static/img/icon_add.png" alt=""/></button>
                </div>
            `
            showUserHtml = showUserHtml + isFalse;
        }
        popupContent.insertAdjacentHTML("afterbegin", showUserHtml);
    },
    friendAlready: function friendAlready(data){
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
        addZone.style.display = "none";
        const addSendedHtml = `
            <div class="search-message">Add sent. Wait for check</div>
        `
        popupContent.insertAdjacentHTML("beforeend", addSendedHtml);
    },
    checkAdd: function checkAdd(headPhoto, username, introduction){
        const src = view.headPhotoSrc(headPhoto);
        let showUserHtml = `
            <div id="userPhoto" class="photo-div">
                <img id="userImg" class="edit-profile-photo" src=${src} alt=""/>
            </div>
            <div class="search-username" >${username}</div>
            <div class="check-added-introduction">${introduction}</div>
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
            <div id="friendCallDiv" class="friend-chat-btn-list">
                <button id="friendStartChat" class="add-friend"><img class="addImg" src="/static/img/icon_start_chat.png" alt=""/></button>
                <button id="friendStartCall" class="add-friend"><img class="addImg" src="/static/img/icon_call.png" alt=""/></button>
            </div>
        `
        popupContent.insertAdjacentHTML("afterbegin", showFriendHtml);
    },
    friendCall: function(src, username){
        let friendCallHtml = `
            <div id="userPhoto" class="photo-div">
                <img id="userImg" class="edit-profile-photo" src=${src} alt=""/>
            </div>
            <div class="search-username" >${username}</div>
            <div class="friend-chat-btn-list">
                <button id="callCatch" class="add-friend"><img class="addImg" src="/static/img/icon_call.png" alt=""/></button>
                <button id="callDrop" class="add-friend"><img class="addImg" src="/static/img/icon_cross.png" alt=""/></button>
            </div>
        `
        popupContent.insertAdjacentHTML("afterbegin", friendCallHtml);
    },
    callWait: function(){
        const friendCallDiv = document.getElementById("friendCallDiv");
        friendCallDiv.innerHTML = "";
        const callingHtml = `
            <img class="callingGif" src="/static/img/phone.gif" alt=""/>
        `
        friendCallDiv.insertAdjacentHTML("beforeend", callingHtml);
    },
    callDropped: function(){
        const friendCallDiv = document.getElementById("friendCallDiv");
        friendCallDiv.innerHTML = "";
        const droppedHtml = `
            <div class="search-message">call was been dropped</div>
        `
        friendCallDiv.insertAdjacentHTML("beforeend", droppedHtml);
    },
    callNoResponse: function(){
        const friendCallDiv = document.getElementById("friendCallDiv");
        friendCallDiv.innerHTML = "";
        const noResponseHtml = `
            <div class="search-message">No response</div>
        `
        friendCallDiv.insertAdjacentHTML("beforeend", noResponseHtml);
    },
    chatBox: function chatBox(src, username){
        chatBoxContent.innerHTML = "";
        let chatBoxHtml = `
            <div class="chat-right-top">
                <div class="chat-right-top-left">
                    <img id="friendHeadPhoto" class="friend-img" src="${src}" alt=""/>
                    <div class="chat-right-top-username">${username}</div>
                </div>
                <div class="chat-right-top-right">
                    <button id="chatBoxCall" class="chat-call-button"><img class="chat-call-img" src="/static/img/icon_call.png" alt=""/></button>
                </div>
            </div>
            <div id="chatRoom" class="chat-right-middle"></div>
            <div class="chat-right-bottom">
                <div id="audioRecord" class="chat-right-bottom-btn"><img class="chat-right-bottom-btn-img" src="/static/img/icon-microphone.png" alt=""></div>
                <div class="input-zone">
                    <input id="messageInput" class="chat-right-bottom-input" placeholder="..." type="text"/>
                    <input id="fileInput" type="file" hidden/>
                    <div id="emoji" class="chat-right-bottom-btn"><img class="chat-right-bottom-btn-img" src="/static/img/icon_smile.png" alt=""></div>
                    <div id="sendPhotoOrFile" class="chat-right-bottom-btn"><img class="chat-right-bottom-btn-img" src="/static/img/icon_add.png" alt=""></div>                
                </div>
                <div id="messageSend" class="chat-right-bottom-btn" ><img class="chat-right-bottom-btn-img" src="/static/img/icon_send.png" alt=""></div>
            </div>
            <div id="previewDiv" class="previewDiv">
                <div id="filePreview" class="filePreview"></div>
                <img id="photoPreview" class="photoPreview" src"" alt="">
                <div id="cancelPreview" class="cancel-preview"><img class="cancel-preview-img" src="/static/img/icon_close.png"></div>
            </div>
            <div id="emojiDiv" class="emojiDiv"></div>
            <div id="recordDiv" class="recordDiv">
                <div id="recordBar" class="recordBar">
                    <div id="recordTime" class="recordTime">30</div>
                </div>
                <div id="record" class="recordBtn"><img id="recordImg" class="recordImg" src="/static/img/icon_play.png"/></div>
                <div id="cancelRecord" class="cancel-preview"><img class="cancel-preview-img" src="/static/img/icon_close.png"></div>
            </div>
        `
        chatBoxContent.insertAdjacentHTML("afterbegin", chatBoxHtml);
    },
    myMessages: function myMessages(time, messages, type){
        function fileType(type){
            if (type === "string"){
                if (/<|>/.test(messages)){
                    return `<div class="messages-myMessage"></div>`
                }else{
                    return `<div class="messages-myMessage">${messages}</div>`
                }
            }else if (type === "image"){
                return `<img class="messages-myPhoto" src="${messages}" alt=""/>`
            }else if (type === "file"){
                return `<div class="messages-myMessage"><a class="file-download" href="${messages}">file download</a></div>`
            }else if (type === "audio"){
                return `<audio controls class="audio-box" src="${messages}"></audio>`
            }
        }
        const messageHtml = `
            <div class="my-message-div">
                <div class="message-box">
                    <div class="time-and-content">
                        <div class="messages-time">${time}</div>
                        ${fileType(type)}
                    </div>
                </div>
            </div>
        `
        chatRoom.insertAdjacentHTML("beforeend", messageHtml);
        if (type === "string" && /<|>/.test(messages)){
            const allMessages = document.querySelectorAll(".messages-myMessage");
            allMessages[allMessages.length - 1].textContent = messages
        }
        chatRoom.scrollTop = chatRoom.scrollHeight;
    },
    friendMessages: function friendMessages(time, messages, type){
        function fileType(type){
            if (type === "string"){
                if (/<|>/.test(messages)){
                    return `<div class="messages-friendMessage"></div>`
                }else{
                    return `<div class="messages-friendMessage">${messages}</div>`
                }
            }else if (type === "image"){
                return `<img class="messages-myPhoto" src="${messages}" alt=""/>`
            }else if (type === "file"){
                return `<div class="messages-friendMessage"><a class="file-download" href="${messages}">file download</a></div>`
            }else if (type === "audio"){
                return `<audio controls class="audio-box" src="${messages}"></audio>`
            }else if (type === "recommend"){
                let src = view.headPhotoSrc(messages.headPhoto);
                let username = messages.username;
                return `
                    <div class="recommend-friend">
                        <img class="recommend-img" src="${src}" alt=""/>
                        <div class="recommend-username" >${username}</div>
                    </div>
                `
            }
        }
        const messageHtml = `
            <div class="friend-message-div">
                <div class="message-box">
                    <div class="time-and-content">
                    ${fileType(type)}
                    <div class="messages-time">${time}</div>
                    </div>
                </div>
            </div>
        `
        chatRoom.insertAdjacentHTML("beforeend", messageHtml);
        if (type === "string" && /<|>/.test(messages)){
            const allMessages = document.querySelectorAll(".messages-friendMessage");
            allMessages[allMessages.length - 1].textContent = messages
        }
        chatRoom.scrollTop = chatRoom.scrollHeight;
    },
    chatRedTag: function chatRedTag(unRead){
        if (unRead === 0){
            return false;
        }
        const RedTag = `<div class="chat-tag">${unRead}</div>`
        chatTag.insertAdjacentHTML("beforeend", RedTag);
    },
    addRedTag: function addRedTag(addCount){
        if (addCount === 0){
            return false;
        }
        const RedTag = `<div class="chat-tag">${addCount}</div>`
        addTag.insertAdjacentHTML("beforeend", RedTag);
    },
    emoji: function (){
        let emojiHtml = ``
        for (let i=0; i<80; i++){
            function number(){
                const no = 128512 + i
                const stringNo = "&#" + no.toString();
                return stringNo
            }
            emojiHtml += `<div class="emojis">${number()}</div>`
        }
        emojiDiv.insertAdjacentHTML("beforeend", emojiHtml)
    },
    recordBox: function(){
        recordDiv.innerHTML = "";
        const recordHtml = `
            <div id="recordBar" class="recordBar">
                <div id="recordTime" class="recordTime">30</div>
            </div>
            <div id="record" class="recordBtn"><img id="recordImg" class="recordImg" src="/static/img/icon_play.png"/></div>
            <div id="cancelRecord" class="cancel-preview"><img class="cancel-preview-img" src="/static/img/icon_close.png"></div>
        `
        recordDiv.insertAdjacentHTML("beforeend", recordHtml)
    },
    audio: function(){
        recordBar.innerHTML = "";
        const audioHtml = `
            <audio controls id="audioResult" class="audio-box"></audio>
        `
        recordBar.insertAdjacentHTML("beforeend", audioHtml)
    },
    recordCount: function(){
        recordBar.innerHTML = "";
        const audioHtml = `
            <div id="recordTime" class="recordTime">30</div>
        `
        recordBar.insertAdjacentHTML("beforeend", audioHtml)
    },
    showSelection: function(){
        recordDiv.innerHTML = "";
        const selectionHtml = `
            <div class="selection">How to start?</div>
        `
        recordDiv.insertAdjacentHTML("beforeend", selectionHtml)
    },
    changeLogout: function(){
        const successHtml = `
            <div>Email or Password are changed, please login again</div>
            <button id="changeLogout" class="changeLogout">logout</button>
        `
        popupInside.insertAdjacentHTML("beforeend", successHtml)
    },
}

export default view;