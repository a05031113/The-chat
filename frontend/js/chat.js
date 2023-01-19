const logout = document.getElementById("logout");
const loading = document.getElementById("loading");
const photoIcon = document.getElementById("photoIcon");
const backBlock = document.getElementById("backBlock");
const profileBox = document.getElementById("profileBox");
const changePhoto = document.getElementById("changePhoto");
const uploadPhoto = document.getElementById("uploadPhoto");
const changedImg = document.getElementById("changedImg");
const saveProfile = document.getElementById("saveProfile");

let view = {
    enterProfile: function enterProfile(){
        profileBox.style.display = "flex";
        backBlock.style.display = "block";
    },
    leaveProfile: function leaveProfile(){
        profileBox.style.display = "none";
        backBlock.style.display = "none";
    },
    headPhotoFresh: function headPhotoFresh(url){
        photoIcon.src = url;
        changedImg.src = url;
    }
}

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

logout.addEventListener("click", ()=>{
    model.logout();
});
photoIcon.addEventListener("click", view.enterProfile);
window.addEventListener("click", (event)=>{
    if (event.target === backBlock){
        view.leaveProfile();
    }
});
changePhoto.addEventListener("click", ()=>{
    uploadPhoto.click();
});
uploadPhoto.addEventListener("change", (event)=>{
    const file = event.target.files[0];
    if (file){
        let src = URL.createObjectURL(file);
        changedImg.src = src;
        // avc
    }
});
saveProfile.addEventListener("click", ()=>{
    const file = uploadPhoto.files[0]
    model.updateProfilePhoto(file);
})

let controller = {
    init: async function(){
        await model.refresh();
    }
};
controller.init();