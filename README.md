# [the-chat](https://the-chat.live)

## Core Feature

- Real-time communication, including message(text message, emoji, audio, image, file) and video call

### Real-time message

![](/Demo/Real-time-message.gif)

#### Main Skill: WebSocket

WebSocket: A protocol based on TCP connection. Different with HTTP/HTTPS which is stateless, WebSocket only needs one HandShake to create connection and do not need to check the state of it so it achieve that send information through server to others in real-time.

![](/Demo/httpVSwebsocket.png)

### Video call

![](/Demo/video-chat.gif)

#### Main Skill: WebRTC (Peer.js)

WebRTC: A framework enables you to do real time communication with APIs such as RTCPeerConnection and MediaStream. Compared to WebSocket which still need to pass information through server, WebRTC send information directly between clients with lower latency.

![](/Demo/webSocket-vs-webRTC.png)

### Web-push notification

![](/Demo/notification.png)

#### Main Skill: Web-Push

Web-Push Notification is based on Push API and Notification API. We can register a service worker in browser and send information from backend to service worker. After receive the information, service worker can show notification to client even without focusing on certain website.

---

## Project Architecture

![](/Demo/architecture.png)

---

## Technique

### Backend

#### language and Framework

- Golang
- Gin-Gonic

#### Cloud VM

- AWS EC2

#### realtime message

- WebSocket

#### video chat

- webRTC(peer.js)

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

#### https/Proxy

- Nginx

### Frontend

- Html
- Javascript
- CSS
