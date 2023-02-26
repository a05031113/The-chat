import model from "./modelRoom.js";
import view from "./viewRoom.js"

cancel.addEventListener("click", ()=>{
    ws.send(JSON.stringify({"drop": true, "from": userData.ID}))
    window.close();
});
screenShare.addEventListener("click", ()=>{
    controller.startScreenShare();
});
microphone.addEventListener("click", ()=>{
    controller.switchMicrophone();
});
camera.addEventListener("click", ()=>{
    controller.switchCamera();
});
window.addEventListener("beforeunload", ()=>{
    ws.send(JSON.stringify({"drop": true, "from": userData.ID}))
})

let controller = {
    init: async function(){
        userData = await model.getUserData();

        ws = new WebSocket("wss://" + document.location.host + "/ws/" + roomID);

        ws.addEventListener("open", ()=>{
            ws.send(JSON.stringify({"join": true, "from": userData.ID}))
        }) 
        ws.addEventListener("close", ()=>{
            console.log("disconnected")
        })
        ws.addEventListener("message", async (event)=>{
            const message = JSON.parse(event.data);
            if (message.from === userData.ID){
                return
            }
            if (message.join){
                await controller.createRoom();
                await ws.send(JSON.stringify({"create": true, "from": userData.ID}))
            }
            if (message.create){
                await controller.joinRoom();
            }
            if (message.drop){
                window.close();
            }
        });
    },
    createRoom: function(){
        peer = new Peer(roomID);
        peer.on("open", ()=>{
            getUserMedia({video: true, audio: true}, (stream)=>{
                localStream = stream;
                localVideo.srcObject = localStream;
                localVideo.play();
            },(err)=>{
                console.log(err)
            })
        });
        peer.on("call", (call)=>{
            call.answer(localStream);
            call.on("stream", (stream)=>{
                remoteVideo.srcObject = stream;
                remoteVideo.play()
            })
            currentPeer = call;
        })
    },
    joinRoom: function(){
        peer = new Peer()
        peer.on("open", ()=>{
            getUserMedia({video: true, audio: true}, (stream)=>{
                localStream = stream;
                localVideo.srcObject = localStream;

                let call = peer.call(roomID, stream)
                call.on("stream", (stream)=>{
                    remoteVideo.srcObject = stream;
                    remoteVideo.play();
                })
                currentPeer = call;
            })
        })
    },
    switchMicrophone: function(){
        const videoTrack = localStream.getTracks().find(track => track.kind === "audio");
        if (videoTrack.enabled){
            videoTrack.enabled = false;
            microphoneOn = false;
            view.switchMicrophone()
        }else{
            videoTrack.enabled = true;
            microphoneOn = true;
            view.switchMicrophone()
        }
    },
    switchCamera: function(){
        const videoTrack = localStream.getTracks().find(track => track.kind === "video");
        if (videoTrack.enabled){
            videoTrack.enabled = false;
            cameraOn = false;
            view.switchCamera()
        }else{
            videoTrack.enabled = true;
            cameraOn = true;
            view.switchCamera()
        }
    },
    startScreenShare: function(){
        if (screenSharing) {
            controller.stopScreenSharing()
            view.screenStatus(screenSharing)
            return
        }
        navigator.mediaDevices.getDisplayMedia({ video: true }).then((stream) => {
            screenStream = stream;
            localVideo.srcObject = screenStream;
            let videoTrack = screenStream.getVideoTracks()[0];
            videoTrack.onended = () => {
                controller.stopScreenSharing()
            }
            if (peer) {
                let sender = currentPeer.peerConnection.getSenders().find(function (s) {
                    return s.track.kind == videoTrack.kind;
                })
                sender.replaceTrack(videoTrack);
                screenSharing = true;
                view.screenStatus();
            }
        })    
    },
    stopScreenSharing: function(){
        if (!screenSharing) return;
        let videoTrack = localStream.getVideoTracks()[0];
        localVideo.srcObject = localStream;
        if (peer) {
            let sender = currentPeer.peerConnection.getSenders().find(function (s) {
                return s.track.kind == videoTrack.kind;
            })
            sender.replaceTrack(videoTrack)
        }
        screenStream.getTracks().forEach(function (track) {
            track.stop();
        });
        screenSharing = false
    }
}
controller.init();

