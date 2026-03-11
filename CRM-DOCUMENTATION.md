# DSignXT CRM - Comprehensive Team Documentation

This document serves as the central manual for the DSignXT CRM platform. It outlines the core features, recent major updates, and step-by-step instructions on how the agency team should utilize the platform—especially regarding the new Client Access functionalities.

---

## 🏗️ 1. Platform Overview 

DSignXT is an agency-focused CRM designed to help you manage leads, pipelines, and analytics across multiple clients simultaneously, while securely offering those clients limited access to see their own performance metrics without exposing cross-agency data.

### Key Workflows:
1. **Lead Ingestion:** Connect Website forms, Meta Ads, Google Ads, or Google Sheets to automatically catch incoming leads for a specific client.
2. **Lead Routing & Management:** Internal team members claim leads, add notes, change statuses (New, Contacted, Qualified, Won, etc.), and track follow-ups.
3. **Analytics Tracking:** Automatically charts pipeline performance, status distribution, and top campaigns.
4. **Client Portal:** Give your agency clients a secure login so they can track their *own* leads and analytics in real-time.

---

## 🔐 2. Roles and Permissions System

The CRM now features a heavily upgraded, granular permission system to guarantee absolute security. 

### Internal Agency Roles
The internal team (Suriya, Prasanth, Viknesh, etc.) consists of Super Admins, Admins, Managers, and Executives. 
- **Super Admins:** Have unfettered access to everything. They are the only role allowed to manage "Client Logins".
- **Granular Feature Access:** When a Super Admin invites or edits a team member via the **"Team"** page, they can explicitly check/uncheck which modules that user has access to. If you uncheck "Integrations" for an Executive, the Integrations tab will disappear from their screen entirely.

### The "Client" Role
Client users have absolute data segregation. The backend forces queries to match `where clientId = ?`. A client user will *never* see records, analytics, or UI elements that do not explicitly belong strictly to their linked CRM client.

---

## 👥 3. Internal Team Management (`Team` Page)

Found in the sidebar under **Team**, this section is exclusively for managing agency staff.

**How to Invite a Staff Member:**
1. Click **"Invite User"**.
2. Fill out their Name, Agency Email, and Role.
3. **Granular Permissions:** Check exactly which pages they should have access to (Dashboard, Clients, Leads, Pipeline, Analytics, etc).
4. **Assign to Clients:** You can link staff members to specific clients, making it easier to filter views on the Dashboard.
5. Hit **Send Invite**. 

*(Note: New internal users currently default to the password `dsignxt123`. They will use their email and this password to log in).*

---

## 🔑 4. Managing Client Portals (`Client Logins` Page)

Found in the sidebar under **Client Logins**. *(Super Admin Only).*

Previously, client credentials were mixed in with the internal team table, or buried inside client settings. Now, there is a dedicated headquarters for managing what clients can access.

**How to Give a Client Access to the CRM:**
1. Navigate to **Client Logins** in the left sidebar.
2. Click **Create Client Login**.
3. **Link to CRM Client:** Select their company from the dropdown menu (e.g. "Timeline" or "Vireka"). *This is critical—it ensures they only see their own leads!*
4. Enter their **Email**.
5. Type an **Initial Password** (which you securely share with them).
6. **Client Display Permissions:** Just like internal staff, you can lock down what a client sees! 
   - *Example Formulation:* By default, you might want to only check **Analytics**. When the client logs in, they will *only* have an Analytics tab in their sidebar showing charts scoped specifically to their leads. You can alternatively check **Leads** and **Pipeline** if you want them to see raw data.
7. Click **Create Login**.

**How to Reset a Client's Password:**
1. Go to **Client Logins**.
2. Click the three-dots (⋮) action menu next to their name and click **Edit**.
3. Type a new password in the "New Password" box.
4. Save updates. 

---

## 📊 5. Client-Specific Analytics

The Dashboard and Analytics engines have been deeply refactored so that "Client Users" have a premium experience looking at their own metrics, without seeing agency charts.
- **Agency View:** If an Admin clicks Analytics, they see charts like "Leads by Client" or "Team Assignment" across the entire agency.
- **Client View:** If a Client clicks Analytics, those cross-agency charts explicitly disappear. Instead, the charts for "Status Distribution", "Campaigns", and top metrics automatically filter themselves strictly to that specific client's data.

---

## 📈 6. Integration: Google Sheets Live Sync 

We've introduced real-time, instantaneous data ingestion natively from Google Sheets!

**How to Connect a Client's Google Sheet:**
1. Go to **Integrations** in the sidebar.
2. Click **Google Sheets**.
3. Select the Client this sheet belongs to.
4. Name the source (e.g. "Q1 Referral Sheet").
5. The CRM will instantly generate a Webhook URL and a very short **Google Apps Script** snippet.
6. Open your Google Sheet, click **Extensions > Apps Script** in the top menu.
7. Clear out any existing code and **Paste** the code the CRM gave you.
8. Hit **Save**. 

**Result:** Every time someone makes an edit or adds a new row to that Google Sheet, the Apps Script instantly POSTs that new row to the CRM. The new lead will appear "live" on the Leads page and immediately reflect in the Analytics dashboard. No polling or delays!

---

## ✅ Best Practices & Quick Tips
- Never handle client logins in the `Team` page. `Team` is strictly for Internal Staff. Use `Client Logins`.
- If a client complains they see "too much" (e.g. Pipeline settings they don't understand), simply go to `Client Logins`, Edit their user, and uncheck "Pipeline" from their Permissions box.
- Test webhook integrations by configuring them first, then submitting a row in your spreadsheet *before* trusting a campaign to go live.
