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
    friendMode: function friendMode(){
        console.log("friendMode")
    },
    chatMode: function chatMode(){
        console.log("chatMode")
    },
    addMode: function addMode(allUserData, userData, addData){
        let addSent;
        for (let i = 0; i < allUserData.data.length; i++){
            if (searchInput.value === allUserData.data[i].username){
                if (userData.Friend.includes(allUserData.data[i]._id)){
                    view.showPopup();
                    view.friendAlready(allUserData.data[i]);
                    return false;
                }else if (addData){
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
            let auth = await model.refresh();
            if (!auth){
                return false;
            }        
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
            let auth = await model.refresh();
            if (!auth){
                return false;
            }        
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
            let auth = await model.refresh();
            if (!auth){
                return false;
            }        
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
    makeRoomId: function makeRoomId(username, userData, allUserData){
        let idList = [userData.ID];
        for (let i=0; i<allUserData.length; i++){
            if (username === allUserData[i].username){
                idList.push(allUserData[i]._id);
            }
        }
        idList.sort();
        let roomId = idList[0] + "," + idList[1];
        return roomId;
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
        if (roomResult.data){
            const messages = roomResult.data.message

            for (let i=0; i<messages.length; i++){
                if (messages[i].sendId === userData.ID){
                    let message = messages[i].content
                    let timeNow = new Date(messages[i].time)
                    let timeMinutes = ("0" + timeNow.getMinutes()).slice(-2);
                    let dateTime = timeNow.getHours() + ":" + timeMinutes; 
                    view.myMessages(dateTime, message)
                }else{
                    let message = messages[i].content
                    let timeNow = new Date(messages[i].time)
                    let timeMinutes = ("0" + timeNow.getMinutes()).slice(-2);
                    let dateTime = timeNow.getHours() + ":" + timeMinutes; 
                    view.friendMessages(dateTime, message)
                }
            }    
        }
    }
}

export default model;