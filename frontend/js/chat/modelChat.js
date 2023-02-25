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
            let auth = await model.refresh();
            if (!auth){
                return false;
            }        
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
            let auth = await model.refresh();
            if (!auth){
                return false;
            }        
            const response = await fetch("/api/user/headPhoto", {
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
            if (!userData.HeadPhoto){
                userData.HeadPhoto = photoUrl;
            }
        }catch(error){
            console.log({"error": error})
        }
    },
    updateUserInformation: async function(data){
        try{
            let auth = await model.refresh();
            if (!auth){
                return false;
            }  
            const response = await fetch("/api/user/update/username", {
                method: "POST",
                body: JSON.stringify(data),
                headers: {
                    "Content-type": "application/json",
                }
            });
            const result = await response.json();
            return result;
        }catch(error){
            console.log({"error": error})
        }
    },
    changePassword: async function(data){
        try{
            let auth = await model.refresh();
            if (!auth){
                return false;
            }  
            const response = await fetch("/api/user/update/password", {
                method: "POST",
                body: JSON.stringify(data),
                headers: {
                    "Content-type": "application/json",
                }
            });
            const result = await response.json();
            return result;
            // const result = await response.json();
            // return result;
        }catch(error){
            console.log({"error": error})
        }
    },
    allUser: async function allUser(){
        try{
            let auth = await model.refresh();
            if (!auth){
                return false;
            }        
            const response = await fetch("/api/user/allUser", {
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
    addMode: async function addMode(data){
        try{
            let auth = await model.refresh();
            if (!auth){
                return false;
            }        
            const response = await fetch("/api/user/search", {
                method: "POST",
                body: JSON.stringify(data),
                headers: {
                    "Content-type": "application/json",
                }
            });
            const result = await response.json()
            if (result.data){
                if (!userData.Friend){
                    userData.Friend = [];
                }
                let addSent;
                if (addData){
                    const found = addData.findIndex(item => item.username === searchInput.value)
                    if (found !== -1){
                        addSent = true;
                        view.showPopup();
                        view.searchUser(addData[found], addSent)
                        return false;
                    }else{
                        addSent = false;     
                    }
                }
                view.showPopup();
                view.searchUser(result.data, addSent);
                return result.data;   
            } else{
                return false;
            }
        }catch(error){
            console.log({"error": error})
        }
    },
    addFriend: async function addFriend(data){
        try{
            let auth = await model.refresh();
            if (!auth){
                return false;
            }        
            const response = await fetch("/api/chat/add/friend", {
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
            let auth = await model.refresh();
            if (!auth){
                return false;
            }        
            const response = await fetch("/api/chat/add/data", {
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
            let auth = await model.refresh();
            if (!auth){
                return false;
            }        
            const response = await fetch("/api/chat/add/check", {
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
    makeRoomId: function makeRoomId(username, userData){
        let idList = [userData.ID];
        let friendId;
        for (let i=0; i<userData.Friend.length; i++){
            if (username === userData.Friend[i].username){
                idList.push(userData.Friend[i]._id);
                friendId = userData.Friend[i]._id;
            }
        }
        idList.sort();
        let roomId = idList[0] + "," + idList[1];
        return {"roomId": roomId, "friendId": friendId};
    },
    sendMessage: async function sendMessage(data){
        try{
            let auth = await model.refresh();
            if (!auth){
                return false;
            }  
            const response = await fetch("/api/messages/send", {
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
            console.log(error)
        }
    },
    getRooms: async function getRooms(){
        try{ 
            let auth = await model.refresh();
            if (!auth){
                return false;
            }        
            const response = await fetch("/api/messages/room", {
                method: "GET",
                headers: {
                    "Content-type": "application/json",
                }
            });
            const result = await response.json()
            if (response.status === 200){
                return result;
            }else{
                return false
            }
        }catch(error){
            console.log(error)
        }
    }, 
    getMessage: async function getMessage(data){
        try{
            let auth = await model.refresh();
            if (!auth){
                return false;
            }  
            const response = await fetch("/api/messages/room", {
                method: "POST",
                body: JSON.stringify(data),
                headers: {
                    "Content-type": "application/json",
                }
            });
            const result = await response.json()
            if (response.status === 200){
                return result;
            }else{
                return false
            }
        }catch(error){
            console.log(error)
        }
    },
    showMessage: async function showMessage(roomId){
        const roomData = {"roomId": roomId}
        const roomResult = await model.getMessage(roomData)
        if (roomId.split(",")[1] === "Demo"){
            if (roomResult.data){
                const messages = roomResult.data.message
                for (let i=0; i<messages.length; i++){
                    let message = messages[i].content;
                    let messageType = messages[i].type;
                    let timeNow = new Date(messages[i].time);
                    let timeMinutes = ("0" + timeNow.getMinutes()).slice(-2);
                    let dateTime = timeNow.getHours() + ":" + timeMinutes; 
                    view.myMessages(dateTime, message, messageType);    
                }    
            }   
            setTimeout(()=>{
                chatRoom.scrollTop = chatRoom.scrollHeight;
            }, 1000)    
            return 
        }        
        if (roomResult.data){
            const messages = roomResult.data.message

            for (let i=0; i<messages.length; i++){
                let message = messages[i].content;
                let messageType = messages[i].type;
                let timeNow = new Date(messages[i].time);
                let timeMinutes = ("0" + timeNow.getMinutes()).slice(-2);
                let dateTime = timeNow.getHours() + ":" + timeMinutes; 
                if (messages[i].sendId === userData.ID){
                    view.myMessages(dateTime, message, messageType);
                }else{
                    view.friendMessages(dateTime, message, messageType)
                }
            }    
        }
        setTimeout(()=>{
            chatRoom.scrollTop = chatRoom.scrollHeight;
        }, 1000)
    },
    resetUnRead: async function resetUnRead(data){
        try{
            let auth = await model.refresh();
            if (!auth){
                return false;
            }  
            const response = await fetch("/api/messages/resetUnRead", {
                method: "PATCH",
                body: JSON.stringify(data),
                headers: {
                    "Content-type": "application/json",
                }
            });
            if (response.status === 200){
                return true;
            }else{
                return false
            }
        }catch(error){
            console.log(error)
        }
    },
    messageFileSend: async function(file, fileName, fileType, friendId){
        let content;
        let timeNow = new Date();
        let timeMinutes = ("0" + timeNow.getMinutes()).slice(-2);
        const sendTime = timeNow.getHours() + ":" + timeMinutes; 

        if (fileType === "string"){
            content = file; 
        }else{
            const fileNameData = {
                "fileName": fileName
            }
            content = await model.R2FileSend(file, fileNameData);
        }
        const data = {
            "roomId": roomId,
            "content": content,
            "sendTime": timeNow,
            "type": fileType,
        }
        const notification = {
            "to": friendId,
            "type": "message",
            "messageType": fileType,
            "who": userData.ID,
            "roomId": roomId,
            "content": content,
            "sendTime": timeNow,
        }
        model.sendMessage(data);
        view.myMessages(sendTime, content, fileType);
        notifyConn.send(JSON.stringify(notification));
        messageInput.value = "";   
        setTimeout(()=>{
            chatRoom.scrollTop = chatRoom.scrollHeight;
        }, 1500)
    },
    demoMessageFileSend: async function(roomId, file, fileName, fileType){
        let content;
        let timeNow = new Date();
        let timeMinutes = ("0" + timeNow.getMinutes()).slice(-2);
        const sendTime = timeNow.getHours() + ":" + timeMinutes; 

        if (fileType === "string"){
            content = file; 
        }else{
            const fileNameData = {
                "fileName": fileName
            }
            content = await model.R2FileSend(file, fileNameData);
        }
        const data = {
            "roomId": roomId,
            "content": content,
            "sendTime": timeNow,
            "type": fileType,
        }
        model.sendMessage(data);
        view.myMessages(sendTime, content, fileType);
    },
    R2FileSend: async function (file, fileNameData){
        try{
            let auth = await model.refresh();
            if (!auth){
                return false;
            }        
            const response = await fetch("/api/messages/file", {
                method: "POST",
                body: JSON.stringify(fileNameData),
                headers: {
                    "Content-type": "application/json",
                }
            });
            const result = await response.json();
            const url = result.PresignedUrl;
            const photoUrl = result.PhotoUrl;
            await fetch( url, {
                method: "PUT",
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: file
            })
            return photoUrl;
        }catch(error){
            console.log({"error": error})
        }
    },
    totalUnRead: function totalUnRead(){
        let count = 0;
        for (let i=0; i<roomList.length; i++){
            if (roomList[i].unRead[userData.ID] === undefined || !roomList[i].unRead[userData.ID]){
                continue
            }
            count += roomList[i].unRead[userData.ID]
        }
        if (count >= 99){
            count = 99
        }
        return count
    },
    totalAdded: function totalAdded(){
        let count = 0;
        for (let i=0; i<addedData.length; i++){
            count ++;
        }
        if (count >= 99){
            count = 99
        }
        return count
    },
    friendRecommend: async function(){
        try{
            let auth = await model.refresh();
            if (!auth){
                return false;
            }        
            const response = await fetch("/api/user/recommend", {
                method: "GET",
                headers: {
                    "Content-type": "application/json",
                }
            });
            const result = await response.json();
            return result;
        }catch(error){
            console.log({"error": error})
        }
    }
}

export default model;