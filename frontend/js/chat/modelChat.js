import view from "./viewChat.js";

let model = {
    logout: async function logout(){
        try{
            let response = await fetch("/api/logout", {
                method: "DELETE"
            });
            if (response.status===200){
                localStorage.removeItem("headPhoto")
                window.location.href = "/";
            }else{
                return false;
            }
        }catch(error){
            console.log({"error": error});
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
                return true;
            }else{
                window.location.href = "/";
            }
        }catch(error){
            console.log({"error": error})
        }
    },
    getUserData: async function getUserData(){
        try{
            const response = await fetch("/api/user/data", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                }
            });
            const result = await response.json();
            return result
        }catch(error){
            console.log({"error": error})
        }
    },
    loadHeadPhoto: function loadHeadPhoto(url){
        try{
            if (url.length > 5){
                view.headPhotoFresh(url);
            }
        }catch(error){
            console.log(error)
        }
    },
    updateProfilePhoto: async function updateProfilePhoto(file){
        try{
            const response = await fetch("/api/user/presigned", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                }
            });
            const result = await response.json();
            const url = result.PresignedUrl;
            const photoUrl = result.PhotoUrl;
            await fetch(url, {
                method: "PUT",
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: file
            })
            localStorage.setItem("headPhoto", photoUrl);
            location.reload();
        }catch(error){
            console.log({"error": error})
        }
    },
    allUser: async function allUser(){
        try{
            const response = await fetch("/api/chat/allUser", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                }
            });
            const result = await response.json();
            return result;
        }catch(error){
            console.log({"error": error})
        }
    },
    friendMode: function friendMode(){
        console.log("friendMode")
    },
    chatMode: function chatMode(){
        console.log("chatMode")
    },
    addMode: function addMode(allUserData, addData){
        let addSent;
        for (let i = 0; i < allUserData.data.length; i++){
            if (searchInput.value === allUserData.data[i].username){
                if (addData){
                    if (addData.includes(allUserData.data[i]._id)){
                        addSent = true;
                        view.showPopup();
                        view.searchUser(allUserData.data[i], addSent)
                        return false;
                    }else{
                        addSent = false;
                    }
                }
                view.showPopup();
                view.searchUser(allUserData.data[i], addSent);
                return allUserData.data[i]._id;
            }
        }
        return false;
    },
    addFriend: async function addFriend(data){
        try{
            const response = await fetch("/api/chat/addFriend", {
                method: "POST",
                body: JSON.stringify(data),
                headers: {
                    "Content-type": "application/json",
                }
            });
            if (response.status === 200){
                return true;
            }else{
                return false;
            }
        }catch(error){
            console.log({"error": error})
        }
    },
    addData: async function addData(){
        try{
            const response = await fetch("/api/chat/addData", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                }                
            });
            const result = await response.json();
            return result;
        }catch{
            console.log({"error": error})
        }
    },
    checkAdded: async function checkAdded(data){
        try{
            const response = await fetch("/api/chat/checkAdded", {
                method: "POST",
                body: JSON.stringify(data),
                headers: {
                    "Content-type": "application/json",
                }
            });
            if (response.status === 200){
                return true;
            }else{
                return false;
            }
        }catch(error){
            console.log({"error": error})
        }
    },
    addFriendClick: function addClick(className){
        let friendList= document.querySelectorAll(className);
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
                    view.leavePopup()
                    const messageInput = document.getElementById("messageInput");
                    const messageSend = document.getElementById("messageSend");
                    const log = document.getElementById("chatRoom");

                    if (window["WebSocket"]){
                        let conn = new WebSocket("ws://" + document.location.host + "/ws/");
                        conn.onclose = function (evt) {
                            let item = document.createElement("div");
                            item.innerHTML = "<b>Connection closed.</b>";
                            appendLog(item);
                        };
                        conn.onmessage = function (evt) {
                            let messages = evt.data.split('\n');
                            for (let i = 0; i < messages.length; i++) {
                                let item = document.createElement("div");
                                item.innerText = messages[i];
                                appendLog(item);
                            }
                        };
                        function appendLog(item) {
                            let doScroll = log.scrollTop > log.scrollHeight - log.clientHeight - 1;
                            log.appendChild(item);
                            if (doScroll) {
                                log.scrollTop = log.scrollHeight - log.clientHeight;
                            }
                        }
                        
                        messageInput.addEventListener("keypress", (event)=>{
                            if (event.key === "Enter"){
                                console.log(messageInput.value)
                                conn.send(messageInput.value);
                                messageInput.value = "";
                            }
                        });
    
                    }else {
                        let item = document.createElement("div");
                        item.innerHTML = "<b>Your browser does not support WebSockets.</b>";
                        appendLog(item);
                    }
                });
            });
        }
    }
}

export default model;