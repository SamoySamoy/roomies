# Roomies

Roomies is a full-stack real-time collaboration app with a Discord-like structure:
- users join **rooms**,
- communicate in **group channels** and **direct conversations**,
- and participate in **video/screen-sharing meetings**.

The repository is split into:
- `client/`: React + Vite + TypeScript frontend
- `server/`: Express + Socket.IO + Prisma backend
- `deprecated/`: legacy code kept for reference

## High-level architecture

### Frontend (`client/`)
- React app bootstrapped with Vite.
- Routing is managed with `react-router-dom` and includes:
  - public landing page,
  - authenticated exploration and room pages,
  - group chat, direct messages, and video group views,
  - auth screens (login/register/forgot/reset).
- State/data tools include React Query, Zustand, and custom providers.
- UI built with Tailwind and Radix UI components.

### Backend (`server/`)
- Express API mounted at `/api`.
- JWT-protected routes for profiles, rooms, groups, members, messages, conversations, and direct messages.
- Static uploads served from `/api/public`.
- Socket.IO endpoint at `/api/socket` for real-time messaging, typing, moderation events, and meeting presence.
- PeerJS server runs on `PORT + 1` for WebRTC peer coordination.
- Prisma handles relational database access.

## Real-time features

`server/src/ws.ts` defines typed socket events for:
- room membership and role updates,
- group and direct message lifecycle (post/upload/update/delete),
- typing indicators,
- meeting state (join/leave/camera/mic/screen share).

Meeting participant state is currently stored in-memory (`fakeRedis`) per group.

## Run locally

### 1) Server
```bash
cd server
npm install
cp .env.example .env
npm run db:push
npm run db:client
npm run dev
```

### 2) Client
```bash
cd client
npm install
npm run dev
```

## Build commands

- Client: `npm run build` (inside `client/`)
- Server: `npm run build` (inside `server/`)

## Notes

- The `deprecated/` directory contains older Next.js-era files and is not the active runtime path.
- Production server mode serves a built client bundle from the server process.
