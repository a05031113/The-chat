# [The-Chat](https://the-chat.live)

## Core Feature

- Real-time communication, including message (text, emoji, audio, image, file) and video call

## Table of Contents

- [Main Features](#main-features)
  - [Real-Time Message](#real-time-message)
  - [Video Call](#video-call)
  - [Web-Push Notification](#web-push-notification)
- [Project Architecture](#project-architecture)
- [Skills and Techniques](#skills-and-techniques)

## Main Features

### Real-Time Message

![Real-time-message demo](/Demo/Real-time-message.gif)  
(Real-Time-Message demo)

Main Skill: WebSocket  
WebSocket: A protocol based on TCP connection. Different with HTTP/HTTPS which is stateless, WebSocket only needs one HandShake to create connection and do not need to check the state of it so it achieve that send information through server to others in real-time.
![](/Demo/HTTPvsSocket.png)  
(HTTP vs WebSocket)

![](/Demo/message_flow.png)  
(Message Flow)

### Video Call

![Video-Call demo](/Demo/video-chat.gif)  
(Video-Call demo)

Main Skill: WebRTC (PeerJS)  
WebRTC: A framework enables you to do real time communication with APIs such as RTCPeerConnection and MediaStream. Compared to WebSocket which still need to pass information through server, WebRTC send information directly between clients with lower latency.

![](/Demo/WebRTC_flow.png)  
(WebRTC Flow)

### Web-Push Notification

![Web-notification demo](/Demo/notification.png)  
(Web-Push-Notification demo)

Main Skill: Web-Push  
Web-Push Notification is based on Push API and Notification API. We can register a service worker in browser and send information from backend to service worker. After receive the information, service worker can show notification to client even without focusing on certain website.

![](/Demo/Notification_flow.png)  
(Notification Flow)

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

- WebSocket (Gorilla)

#### Video Call

- WebRTC(PeerJS)

#### Database

- Azure CosmosDB(NoSQL)
- Prevent XSS Attack

#### Redis

- AWS Elasticache

#### Authorization

- JWT

#### Storage

- Cloudflare R2 - Presigned Url

#### DNS

- Cloudflare Website

#### HTTPS/Proxy

- Nginx

#### Docker

- Compose

#### RESTful API

- [API Documentation](https://app.swaggerhub.com/apis-docs/a05031113/The-Chat/1.0.0)

### Frontend

- HTML
- JavaScript
- CSS
