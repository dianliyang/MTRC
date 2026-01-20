# MoreThan Reading Group

A modern, full-stack reading group management platform.

## Architecture

This project is built as a monorepo with two main components:

*   **Client (`/client`)**: A **Vue 3** Single Page Application (SPA) built with **TypeScript** and **Vite**. It handles the user interface for browsing books, scheduling gatherings, and managing the library.
*   **Worker (`/worker`)**: A serverless backend built on **Cloudflare Workers**. It uses **Hono** (web framework) and **Drizzle ORM** to interact with a **Cloudflare D1** (SQLite) database.

*(Note: The `server/` directory is a legacy Node.js/Express backend implementation and is currently deprecated in favor of the Cloudflare Worker).*

## Features

*   **Library Management:** Search Google Books and add them to your group's library.
*   **Voting/Selection:** Mark books as "Current", "Read", or "Candidate".
*   **Gatherings:** Schedule and manage reading group meetings.
*   **Secure Authentication:** JWT-based login for curators and administrators.
*   **Admin Controls:** Invite new members and manage roles directly from the dashboard.
*   **Notifications:** Automated Email and Signal notifications when a new book is selected (via Worker).
*   **Responsive Design:** Optimized for both desktop and mobile web.

## Quick Start (Local Development)

### 1. Backend (Worker)
Navigate to the worker directory to start the local backend.

```bash
cd worker
npm install
# 1. Create .dev.vars with JWT_SECRET=your_secret
# 2. Generate and apply migrations
npm run generate
npx wrangler d1 migrations apply morethan-db --local
# 3. Start dev server
npm run dev
```
*   This will start the local Worker API (usually at `http://localhost:8787`).

### 2. Frontend (Client)
Navigate to the client directory to start the dev server.

```bash
cd client
npm install
npm run dev
```
*   The frontend will be available at `http://localhost:5173`.

## Troubleshooting

### Database Issues
If you encounter 500 errors on the API, ensure you have:
1.  Run `npm run generate` and applied migrations (`--local` for dev, `--remote` for prod).
2.  Configured `JWT_SECRET` in `.dev.vars` (local) or via `wrangler secret` (remote).
3.  Seeded an initial admin user (see [DEPLOY.md](DEPLOY.md)).

## Deployment

This project is designed to be deployed entirely on **Cloudflare**.

*   **Frontend:** Cloudflare Pages
*   **Backend:** Cloudflare Workers + D1 Database

👉 **See [DEPLOY.md](DEPLOY.md) for detailed step-by-step deployment instructions.**

## Project Structure

```
.
├── client/         # Vue 3 Frontend
│   ├── src/
│   └── ...
├── worker/         # Cloudflare Worker Backend
│   ├── src/
│   └── ...
├── server/         # Legacy Express Backend (Reference)
├── DEPLOY.md       # Deployment Guide
└── README.md       # Project Overview
```
