# Unified & Scalable Deployment Guide

You requested a completely free, highly scalable, and extremely low-maintenance deployment for basically the whole project (frontend + backend APIs) combined.

We have successfully **unified your codebase**. Your `server/index.js` uses an integrated pipeline meaning that a single Node.js runtime will host *both* your database APIs *and* your React dashboard simultaneously on the EXACT same domain URL.

This completely bypasses annoying "Cross-Origin (CORS)" errors and saves you from paying for two separate servers!

## 🚀 The Easiest Free Deployment: Render.com

Render.com offers a free "Web Service" tier that connects directly to GitHub. Because we unified the codebase and added a custom `start` script, Render can launch your entire CRM with zero hassle.

### Step 1: Push your code to GitHub
Make sure all your latest edits to the CRM are pushed to a repository on your GitHub account.

### Step 2: Connect to Render
1. Go to [Render.com](https://render.com) and create a free account.
2. Click **New +** and select **Web Service**.
3. Connect your GitHub account and select your CRM repository.

### Step 3: Configure the Easy Deployment
Fill in the deployment settings exactly like this:
- **Name:** `dsignxt-crm` (or whatever you prefer)
- **Environment:** `Node`
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm run start`
- **Plan:** Free

### Step 4: Add Persistent Storage (Crucial for SQLite!)
*(Since you use SQLite, free cloud providers spin down inactive nodes and wipe local files. Render allows you to attach a "Disk" to save your database permanently!)*
1. Scroll down to **Advanced** in your Render setup.
2. Click **Add Disk**.
3. **Name:** `crm-db-data`
4. **Mount Path:** `/opt/render/project/src/server/data` (This binds the persistent disk right into your server folder).
5. **Size:** 1 GB (Plenty for thousands of leads!)

*(Note: If you run into paths issues during deployment, simply drop `server/crm.db` inside that mount path and update `server/db.js` to point to it!)*

### Step 5: Click "Create Web Service"
That's literally it! Render will automatically:
1. Install your packages.
2. Build your React Frontend utilizing Vite.
3. Start the combined Node.js Express Server.
4. Issue you a secure `https://your-crm.onrender.com` URL automatically!

Whenever you update your code and push it to GitHub, Render will automatically detect it, rebuild silently, and go live without any disturbance to you or your clients.

### 🌐 API Updates Reflected
Because we are using unified serving, your endpoints look exactly like this universally:
- CRM Portal: `https://your-crm.onrender.com/`
- API Route: `https://your-crm.onrender.com/api/login`
- Webhook Ingestion: `https://your-crm.onrender.com/api/webhooks/your_key`

You can just copy the Webhook URLs generated in your UI and trust them directly in Google Sheets!
