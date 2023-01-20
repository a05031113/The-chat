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
                loading.style.display = "none"
                return true;
            }else{
                window.location.href = "/";
            }
        }catch(error){
            console.log({"error": error})
        }
    },
    getHeadPhoto: function getHeadPhoto(){
        const photoUrl = localStorage.getItem("headPhoto");
        if (photoUrl.length > 50){
            view.headPhotoFresh(photoUrl);
        }
    },
    updateProfilePhoto: async function updateProfilePhoto(file){
        const response = await fetch("/api/user/presigned", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            }
        });
        const result = await response.json();
        console.log(result)
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
    }
}

export default model;