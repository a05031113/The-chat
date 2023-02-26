let view = {
    screenStatus: function () {
        if (screenSharing){
            screenShare.style.backgroundColor = "#d1d1d1";
        }else{
            screenShare.style.backgroundColor = "#ffffff4d";
        }
    },
    switchCamera: function(){
        if (cameraOn){
            camera.style.backgroundColor = "#d1d1d1";
        }else{
            camera.style.backgroundColor = "#ffffff4d";
        }
    },
    switchMicrophone: function(){
        if (microphoneOn){
            microphone.style.backgroundColor = "#d1d1d1";
        }else{
            microphone.style.backgroundColor = "#ffffff4d";
        }
    }
}

export default view;