const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");
const cancel = document.getElementById("cancel");
const microphone = document.getElementById("microphone");
const camera = document.getElementById("camera");
const screenShare = document.getElementById("screenShare");


let userData;

let getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
let localStream;
let remoteStream;
let screenStream;
let peer = null;
let currentPeer = null;
let screenSharing = false;
let microphoneOn = true;
let cameraOn = true;


let ws;

const roomID = location.pathname.split("/")[2];