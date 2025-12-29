```
# 💬 Real-Time Chat Application (MERN + Socket.IO)

A **real-time one-to-one chat application** built using the **MERN stack** with **Socket.IO**, focusing on **backend correctness, real-time communication, and clean architecture**.

This project demonstrates how modern chat systems handle **authentication, message persistence, online/offline presence, and read receipts** without over-engineering.

---

## 🚀 Features

### 🔐 Authentication
- User registration & login
- Password hashing using **bcrypt**
- JWT-based authentication
- Protected REST APIs
- Secure Socket.IO connection using JWT

---

### 💬 Real-Time Messaging
- One-to-one private chat
- Messages delivered instantly using **Socket.IO**
- Graceful handling of reconnects
- Prevents unauthorized socket access

---

### 🟢 Online / Offline Presence
- Tracks active users in real time
- Shows online/offline status
- Stores last seen timestamp

---

### ✅ Read Receipts
- Message states:
  - Sent
  - Delivered
  - Read
- Updates read status when receiver opens the chat

---

### 💾 Message Persistence
- Messages stored in **MongoDB**
- Fetch message history with pagination
- Conversations auto-created between users

---

## 🧠 Tech Stack

**Frontend**
- React (Vite)
- JavaScript
- Tailwind CSS
- Socket.IO Client

**Backend**
- Node.js
- Express.js
- MongoDB + Mongoose
- Socket.IO
- JWT Authentication

**Architecture**
- Monorepo structure
- Controllers → Services → Models
- Centralized error handling
- Logging with Winston

---

## 🏗️ Project Structure (Monorepo)

```

chat-app/
│
├── apps/
│   ├── server/
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── routes/
│   │   │   ├── services/
│   │   │   ├── models/
│   │   │   ├── socket/
│   │   │   ├── middleware/
│   │   │   ├── config/
│   │   │   ├── utils/
│   │   │   ├── app.js
│   │   │   └── server.js
│   │   └── package.json
│   │
│   └── web/
│       ├── src/
│       │   ├── pages/
│       │   ├── components/
│       │   ├── hooks/
│       │   ├── services/
│       │   ├── socket/
│       │   ├── App.jsx
│       │   └── main.jsx
│       └── package.json
│
├── package.json
└── turbo.json

```

---

## 🔄 System Flow (High Level)

```

User A ──▶ REST Login ──▶ JWT
│
├──▶ Socket.IO connect (JWT)
│
├──▶ Send message ───────────────▶ User B
│                                   │
│                                   ├──▶ Message saved to DB
│                                   └──▶ Read receipt emitted

````

---

## ⚙️ Environment Variables

### Backend (`apps/server/.env`)
```env
PORT=5000
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
````

### Frontend (`apps/web/.env`)

```env
VITE_API_BASE_URL=http://localhost:5000
```

---

## ▶️ Running the Project Locally

### 1️⃣ Install dependencies

```bash
npm install
```

### 2️⃣ Start development servers

```bash
npm run dev
```

* Frontend: [http://localhost:5173](http://localhost:5173)
* Backend: [http://localhost:5000](http://localhost:5000)

---

## 🎥 Demo

▶️ **Demo Video:** *(add link here)*

The demo showcases:

* User authentication
* Real-time 1:1 messaging
* Online/offline presence
* Read receipts
* Message persistence

---

## 🛡️ Security Considerations

* JWT validation for REST and Socket connections
* Prevents unauthorized room access
* Input validation on message payloads
* No sensitive data exposed to frontend

---

## 🎯 Learning Outcomes

* Real-time communication using WebSockets
* Authenticated Socket.IO connections
* MongoDB data modeling for chat systems
* Managing user presence and read receipts
* Structuring scalable backend applications

---

## 🔮 Future Improvements

* Typing indicators
* Message delivery retries
* Group chats
* Media sharing
* Push notifications

---

## 👨‍💻 Author

Built with a **backend-first mindset**, focusing on real-world chat application behavior and clean system design.

```

---

### ✅ What this README does well
- Sounds **professional**
- Shows **real engineering depth**
- Avoids tutorial tone
- Easy for recruiters to skim
- Perfect for **GitHub + resume links**

If you want, I can:
- Add **architecture diagrams (Mermaid)**
- Shorten this for **hackathon style**
- Tailor it for **backend-only roles**
- Review your **demo video section**

Just say 👍
```
