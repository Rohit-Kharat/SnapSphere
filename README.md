# SnapSphere 🚀  
**A Scalable, Real-Time Social Media Platform**

SnapSphere is a modern, production-grade social media platform designed to support real-time interactions, immersive user experiences, and scalable system architecture. The platform enables users to share photos, interact through feeds and messages, and receive instant notifications, while ensuring content safety through AI-powered moderation.

---

## ✨ Key Features

- 🔐 **Authentication & Authorization**
  - Secure login with OAuth 2.0
  - Multi-session support across devices

- 📸 **Photo Sharing & Feeds**
  - Upload and share photos
  - Real-time content feeds with efficient pagination

- 💬 **Real-Time Messaging**
  - Private one-to-one chat
  - Low-latency message delivery using WebSockets

- 🟢 **Online / Active Presence**
  - Live user presence and last-seen tracking
  - Powered by Redis-backed real-time state management

- 🔔 **Notifications System**
  - Instant notifications for likes, comments, and messages
  - Persistent storage with real-time fanout

- 🛡️ **AI-Based Spam & Abuse Detection**
  - Automated moderation using LLM-based text classification (Hugging Face)
  - Filters toxic, abusive, and spam content before public visibility

- 🎨 **Modern & Immersive UI**
  - Motion-driven interactions
  - Three.js-powered visual elements for enhanced user engagement

---

## 🏗️ System Architecture

SnapSphere follows an **event-driven, microservices-oriented architecture**:

- **Frontend**
  - Built with Next.js and React
  - Client-side state managed using TanStack React Query and Zustand
  - Motion and visual enhancements using Framer Motion and Three.js

- **Backend**
  - Node.js (NestJS) microservices
  - RESTful APIs for core business logic
  - WebSockets for real-time communication

- **Data Layer**
  - PostgreSQL for relational data and consistency
  - Redis for caching, pub/sub, and presence tracking

- **AI & Moderation**
  - LLM-powered moderation pipeline using Hugging Face
  - Asynchronous processing to ensure low latency

---

## 🛠️ Tech Stack

### Languages
- TypeScript, JavaScript, CSS/SCSS

### Frontend
- Next.js, React
- TanStack React Query
- Zustand
- Framer Motion
- Three.js

### Backend
- Node.js (NestJS)
- REST APIs
- WebSockets

### Database & Caching
- PostgreSQL
- Redis

### Authentication
- OAuth 2.0
- JWT-based access control

### AI / Moderation
- LLM-based text moderation (Hugging Face)

### DevOps & Tooling
- Docker
- GitHub Actions (CI/CD)
- ESLint, Prettier
- Vite / Turbopack (frontend tooling)

---

## 🔄 Real-Time Flow (High Level)

1. User performs an action (message, like, comment)
2. Backend service processes the event
3. Event is published via Redis pub/sub
4. WebSocket server delivers updates in real time
5. Notifications are persisted and emitted instantly

---

## 🚀 Getting Started (Local Setup)

```bash
# Clone the repository
git clone https://github.com/your-username/snapsphere.git
cd snapsphere

# Install dependencies
npm install

# Start backend services
npm run start:backend

# Start frontend
npm run start:frontend
