# MoreThan Reading Club - Deployment Guide

This project consists of a **Vue 3 Client** (Frontend) and a **Cloudflare Worker** (Backend) using D1 (Database). Both are written in **TypeScript**.

## 1. Backend (Cloudflare Worker)

The backend is a serverless API running on Cloudflare Workers with a D1 SQLite database.

### Prerequisites

- Cloudflare Account
- `npm` installed
- Wrangler CLI: `npm install -g wrangler`

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

    - **Crucial:** Copy the `database_id` from the output.

5.  **Configure `wrangler.toml`:**
    - Open `worker/wrangler.toml`.
    - Replace `database_id = "INSERT_YOUR_DATABASE_ID_HERE"` with the ID you just copied.

6.  **Apply Database Migrations:**
    - Generate migrations: `npm run generate`
    - Apply to local: `npx wrangler d1 migrations apply morethan-db --local`
    - Apply to production: `npm run migrate` (Select 'Yes' to confirm).

7.  **Configure Secrets (JWT Authentication):**
    - Generate a secure secret: `openssl rand -base64 32`
    - **Local:** Create `worker/.dev.vars` and add `JWT_SECRET=your_secret`.
    - **Production:** Run `npx wrangler secret put JWT_SECRET` and paste your secret.

8.  **Seed Initial Admin User:**
    - Registration is disabled for the public. You must seed the first admin user manually to access the dashboard.
    - **Local:** Run the following command in the `worker` directory (replace `password123` with a secure password):

    ```bash
    # Password hash for 'password123' (SHA-256): ef92b778ba7157222533ca94db9c687593c6629d84c17b5f4920400b1a030090
    echo "INSERT INTO users (email, password, name, role, created_at, updated_at) VALUES ('admin@example.com', 'ef92b778ba7157222533ca94db9c687593c6629d84c17b5f4920400b1a030090', 'Initial Admin', 'admin', strftime('%s', 'now'), strftime('%s', 'now'));" > seed.sql
    npx wrangler d1 execute morethan-db --local --file=seed.sql
    ```

    - **Production:** Run the same command with the `--remote` flag:

    ```bash
    npx wrangler d1 execute morethan-db --remote --file=seed.sql
    ```

9.  **Deploy the Worker:**
    ```bash
    npm run deploy
    ```

    - Copy the **Worker URL** from the output (e.g., `https://morethan-worker.yourname.workers.dev`).

## 2. Frontend (Client)

The frontend is a Vue 3 SPA hosted on Cloudflare Pages.

### Authentication & Roles

- **Public Access:** View-only access to books and events.
- **Curator Access:** Requires login. Can suggest books and manage events.
- **Admin Access:** Can invite new curators and administrators via the "Invite Curator" section in the Dashboard.

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
    - Create (or update) `.env.production`:
      ```
      VITE_API_URL=https://morethan-worker.yourname.workers.dev
      ```
    - _Note:_ Replace the URL with your actual Worker URL from the previous section.

4.  **Build the Client:**

    ```bash
    npm run build
    ```

    - This generates a `dist` folder.

5.  **Deploy to Cloudflare Pages:**
    - **Option A (Manual):** Upload the `dist` folder to Cloudflare Pages manually.
    - **Option B (Git Integration - Recommended):**
      1.  Push your code to GitHub/GitLab.
      2.  Connect your repo to Cloudflare Pages.
      3.  **Build Settings:**
          - Framework: `Vue`
          - Build Command: `npm run build`
          - Build Output Directory: `client/dist` (Note: Ensure the path is correct relative to your repo root. If `client` is a subfolder, you might need to set the "Root Directory" in Cloudflare settings to `client`).
      4.  **Environment Variables (in Cloudflare Dashboard):**
          - Add `VITE_API_URL` with your Worker URL.

## 3. Verification

1.  Open your deployed Frontend URL.
2.  The app should load and fetch books/meetings from your Cloudflare Worker.
3.  Test adding a book or signing up for the newsletter to verify database connectivity.
