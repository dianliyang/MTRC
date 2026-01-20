# MoreThan Worker (Cloudflare Deployment)

This is the serverless backend for the MoreThan Reading Group, built with **Hono** and **Drizzle ORM** on **Cloudflare Workers** and **D1**.

## Prerequisites

1.  **Cloudflare Account**: You need a Cloudflare account.
2.  **Wrangler CLI**: Install globally or use via `npx`.
    ```bash
    npm install -g wrangler
    ```

## Setup & Deployment Steps

Follow these steps exactly to deploy your backend.

### 1. Install Dependencies
Navigate to this folder and install packages:
```bash
cd worker
npm install
```

### 2. Login to Cloudflare
```bash
npx wrangler login
```
(A browser window will open to authorize).

### 3. Create the Database
Create a new D1 database named `morethan-db`:
```bash
npx wrangler d1 create morethan-db
```
**IMPORTANT:** The output will look like this:
```toml
[[d1_databases]]
binding = "DB"
database_name = "morethan-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```
**Copy the `database_id`** from your output and paste it into `wrangler.toml`, replacing `INSERT_YOUR_DATABASE_ID_HERE`.

### 4. Generate & Apply Migrations
Generate the SQL migration files from the schema:
```bash
npm run generate
```
Apply the migrations to the remote Cloudflare database:
```bash
npm run migrate
```
(Select `Yes` if asked to create the migration).

### 5. Deploy the Worker
Publish your worker to the edge:
```bash
npm run deploy
```
The output will give you a URL, e.g., `https://morethan-worker.yourname.workers.dev`.

### 6. Connect Frontend
1.  Copy your new Worker URL.
2.  Go to your `client` folder.
3.  Update `.env.production` (or your Cloudflare Pages environment variables) with:
    ```
    VITE_API_URL=https://morethan-worker.yourname.workers.dev
    ```
4.  Re-deploy the frontend.

## Local Development
To run the worker locally using a local D1 simulation:
```bash
npm run dev
```
