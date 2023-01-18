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
export default view