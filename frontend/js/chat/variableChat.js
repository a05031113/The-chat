const logout = document.getElementById("logout");
const loading = document.getElementById("loading");
const photoIcon = document.getElementById("photoIcon");
const profileIcon = document.getElementById("profileIcon");
const backBlock = document.getElementById("backBlock");
const profileBox = document.getElementById("profileBox");

const chatBoxContent = document.getElementById("chatBoxContent");

let changePhoto;
let uploadPhoto;
let saveProfile;
let changedImg;

let addZone;

const popup = document.getElementById("popup");
const popupContent = document.getElementById("popupContent");
const leaveBtn = document.getElementById("leaveBtn");
const profileSetup = document.getElementById("profileSetup");

const friendBtn = document.getElementById("friendBtn");
const chatBtn = document.getElementById("chatBtn");
const addBtn = document.getElementById("addBtn");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");

const listContent = document.getElementById("listContent");

let addData;
let addedData;
let userData;
let roomList;

let friendMode = true;
let chatMode = false;
let addMode = false;

let conn;
let notifyConn;

const chatTag = document.getElementById("chatTag");
const addTag = document.getElementById("addTag");

let roomId;
let calling = false;
let peer;
let emojiState = false;
let recordState = false;
let blob;
let audioStream;
let DemoInput = false;

const PhotoDiv = document.getElementById("PhotoDiv");
const Photo = document.getElementById("Photo");

let photoReview;