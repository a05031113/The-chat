import model from "./modelRoom.js";

const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");
const cancel = document.getElementById("cancel");
const microphone = document.getElementById("microphone");
const camera = document.getElementById("camera");
const screen = document.getElementById("screen");


let userData;

let getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
let localStream;
let remoteStream;
let screamStream;
let peer = null;
let currentPeer = null;
let screamSharing = false;


let ws;

const roomID = location.pathname.split("/")[2];

cancel.addEventListener("click", ()=>{
    window.close();
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
                console.log("create Room")
                await controller.createRoom();
                await ws.send(JSON.stringify({"create": true, "from": userData.ID}))
            }
            if (message.create){
                console.log("Join Room")
                await controller.joinRoom();
            }
        });
    },
    createRoom: function(){
        peer = new Peer(roomID);
        peer.on("open", ()=>{
            console.log("Peer Connected");
            getUserMedia({video: true, audio: true}, (stream)=>{
                localStream = stream;
                localVideo.srcObject = localStream;
                localVideo.play();
            },(err)=>{
                console.log(err)
            })
        });
        peer.on("call", (call)=>{
            console.log("remote Connected")
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
            console.log("Joining!!!!")
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
    startScreenShare: function(){
        if (screenSharing) {
            stopScreenSharing()
        }
        navigator.mediaDevices.getDisplayMedia({ video: true }).then((stream) => {
            screenStream = stream;
            let videoTrack = screenStream.getVideoTracks()[0];
            videoTrack.onended = () => {
                stopScreenSharing()
            }
            if (peer) {
                let sender = currentPeer.peerConnection.getSenders().find(function (s) {
                    return s.track.kind == videoTrack.kind;
                })
                sender.replaceTrack(videoTrack)
                screenSharing = true
            }
            console.log(screenStream)
        })    
    },
    stopScreenSharing: function(){
        if (!screenSharing) return;
        let videoTrack = local_stream.getVideoTracks()[0];
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

