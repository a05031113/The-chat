let view = {
    enterProfile: function enterProfile(){
        profileBox.style.display = "flex";
        backBlock.style.display = "block";
    },
    leaveProfile: function leaveProfile(){
        profileBox.style.display = "none";
        backBlock.style.display = "none";
    }
}
export default view