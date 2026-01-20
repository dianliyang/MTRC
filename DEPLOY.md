# MoreThan Reading Group - Deployment Guide

This project consists of a **Vue 3 Client** (Frontend) and a **Cloudflare Worker** (Backend) using D1 (Database). Both are written in **TypeScript**.

## 1. Backend (Cloudflare Worker)

The backend is a serverless API running on Cloudflare Workers with a D1 SQLite database.

### Prerequisites
*   Cloudflare Account
*   `npm` installed
*   Wrangler CLI: `npm install -g wrangler`

### Deployment Steps
1.  **Navigate to the worker directory:**
    ```bash
    cd worker
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Authenticate with Cloudflare:**
    ```bash
    npx wrangler login
    ```

4.  **Create the D1 Database:**
    ```bash
    npx wrangler d1 create morethan-db
    ```
    *   **Crucial:** Copy the `database_id` from the output.

5.  **Configure `wrangler.toml`:**
    *   Open `worker/wrangler.toml`.
    *   Replace `database_id = "INSERT_YOUR_DATABASE_ID_HERE"` with the ID you just copied.

6.  **Apply Database Migrations:**
    *   Generate migrations: `npm run generate`
    *   Apply to production: `npm run migrate` (Select 'Yes' to confirm).

7.  **Deploy the Worker:**
    ```bash
    npm run deploy
    ```
    *   Copy the **Worker URL** from the output (e.g., `https://morethan-worker.yourname.workers.dev`).

---

## 2. Frontend (Client)

The frontend is a Vue 3 SPA hosted on Cloudflare Pages (or any static host).

### Deployment Steps
1.  **Navigate to the client directory:**
    ```bash
    cd ../client
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    *   Create (or update) `.env.production`:
        ```
        VITE_API_URL=https://morethan-worker.yourname.workers.dev
        ```
    *   *Note:* Replace the URL with your actual Worker URL from the previous section.

4.  **Build the Client:**
    ```bash
    npm run build
    ```
    *   This generates a `dist` folder.

5.  **Deploy to Cloudflare Pages:**
    *   **Option A (Manual):** Upload the `dist` folder to Cloudflare Pages manually.
    *   **Option B (Git Integration - Recommended):**
        1.  Push your code to GitHub/GitLab.
        2.  Connect your repo to Cloudflare Pages.
        3.  **Build Settings:**
            *   Framework: `Vue`
            *   Build Command: `npm run build`
            *   Build Output Directory: `client/dist` (Note: Ensure the path is correct relative to your repo root. If `client` is a subfolder, you might need to set the "Root Directory" in Cloudflare settings to `client`).
        4.  **Environment Variables (in Cloudflare Dashboard):**
            *   Add `VITE_API_URL` with your Worker URL.

## 3. Verification

1.  Open your deployed Frontend URL.
2.  The app should load and fetch books/meetings from your Cloudflare Worker.
3.  Test adding a book or signing up for the newsletter to verify database connectivity.
