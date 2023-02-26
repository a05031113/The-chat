# [The-Chat](https://the-chat.live)

## Core Feature

- Real-time communication, including message(text message, emoji, audio, image, file) and video call

## Real-Time Message

![Real-time-message demo](/Demo/Real-time-message.gif)(Real-Time-Message demo)

Main Skill: WebSocket  
WebSocket: A protocol based on TCP connection. Different with HTTP/HTTPS which is stateless, WebSocket only needs one HandShake to create connection and do not need to check the state of it so it achieve that send information through server to others in real-time.

![](/Demo/httpVSwebsocket.png)

## Video Call

![Video-Call demo](/Demo/video-chat.gif)(Video-Call demo)

Main Skill: WebRTC (Peer.js)  
WebRTC: A framework enables you to do real time communication with APIs such as RTCPeerConnection and MediaStream. Compared to WebSocket which still need to pass information through server, WebRTC send information directly between clients with lower latency.

![](/Demo/webSocket-vs-webRTC.png)

## Web-Push Notification

![Web-notification demo](/Demo/notification.png)(Web-Push-Notification demo)

Main Skill: Web-Push  
Web-Push Notification is based on Push API and Notification API. We can register a service worker in browser and send information from backend to service worker. After receive the information, service worker can show notification to client even without focusing on certain website.

---

## Project Architecture

![](/Demo/architecture.png)

---

## Skills and Techniques

### Backend

#### Language and Framework

- Golang
- Gin-Gonic

#### Cloud VM

- AWS EC2

#### Real-Time Message

- WebSocket

#### Video Chat

- WebRTC(peer.js)

#### Database

- Azure CosmosDB(NoSQL)

#### Redis

- AWS Elasticache

#### Authorization

- JWT

#### Storage

- Cloudflare R2

#### DNS

- Cloudflare Website

#### HTTPS/Proxy

- Nginx

#### Docker

- Compose

### Frontend

- Html
- Javascript
- CSS
