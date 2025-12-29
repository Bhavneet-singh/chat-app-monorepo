# Real-Time 1-1 Chat Application

A production-ready real-time chat application built with MERN stack in a monorepo setup.

## Tech Stack

- **Frontend**: React (Vite), JavaScript, Tailwind CSS, Socket.IO client
- **Backend**: Node.js, Express.js, JavaScript (ESM), MongoDB, Socket.IO, JWT
- **Monorepo**: Turborepo with npm workspaces

## Features

- User authentication (JWT)
- Real-time messaging with Socket.IO
- Online/offline presence
- Read receipts
- One-to-one private chats
- REST APIs for messages, conversations, users

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
- Copy `.env.example` to `.env` in `apps/server`
- Configure MongoDB URI, JWT secrets, etc.

3. Start development servers:
```bash
npm run dev
```

Or start individually:
```bash
npm run server:dev
npm run web:dev
```

## Project Structure

```
apps/
  server/     # Express backend with Socket.IO
  web/        # React frontend
packages/
  shared/     # Shared constants and utilities
```

