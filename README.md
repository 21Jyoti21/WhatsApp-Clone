# WhatsApp Clone 💬📞

A full-stack WhatsApp-like real-time chat application built with **Next.js, React, Node.js, Express, Socket.IO, Prisma, and PostgreSQL**.  
It supports **real-time messaging, voice/video calls, media sharing, and online status**.

<p align="center">
  <img src="./client/public/whatsapp.gif" alt="WhatsApp Clone Demo" />
</p>



---

## 🚀 Live Demo

- **Frontend (Vercel):**  
  https://whats-app-clone-eosin.vercel.app

- **Backend (Render):**  
  https://whatsapp-clone-fa3n.onrender.com

---

## ⚠️ Deployment Limitation (Important Note)

This project uses **Socket.IO** for real-time messaging and calls.

Since the application is deployed using:
- **Frontend:** Vercel (serverless)
- **Backend:** Render (free tier)

there are known limitations:

- ❌ WebSocket connections may disconnect or require refresh
- ❌ Real-time messages may not appear instantly
- ❌ Voice/Video calls may fail intermittently

### ✅ Reason
- Vercel uses **serverless functions**, which do not maintain persistent WebSocket connections.
- Render free tier spins down inactive services, breaking socket sessions.

### 🛠️ Recommended Production Setup
For full real-time stability:
- Deploy backend on **AWS EC2 / DigitalOcean / Railway**
- Use **NGINX + PM2**
- Or use **Socket.IO + Redis Adapter**

📌 **All real-time features work correctly in local development.**

---

## 🎥 Demo Recording

👉 **Screen recording of the app (chat, calls, realtime communication):**  

(https://www.youtube.com/watch?v=GRHg-eN2HmI)
---

## ✨ Features

- 🔐 Firebase Authentication
- 💬 Real-time text messaging (Socket.IO)
- 📞 Voice & 📹 Video calling
- 🟢 Online / Offline status
- 🖼️ Image sharing
- 🎙️ Audio message support
- 📜 Chat history with Prisma + PostgreSQL
- ⚡ Optimistic UI updates
- 🌐 Deployed on Vercel & Render

---

## 🛠️ Tech Stack

### Frontend
- Next.js
- React
- Tailwind CSS
- Socket.IO Client
- Firebase Auth
- Axios

### Backend
- Node.js
- Express
- Socket.IO
- Prisma ORM
- PostgreSQL
- Multer (media uploads)

---

## 📂 Project Structure

```text
WhatsApp-Clone/
├── client/        # Next.js frontend
│   ├── src/
│   └── .env
├── server/        # Express + Socket.IO backend
│   ├── routes/
│   ├── controllers/
│   ├── prisma/
│   └── .env
└── README.md
