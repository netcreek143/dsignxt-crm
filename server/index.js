import express from 'express';
import cors from 'cors';
import { db, initDb, dbRun, dbQuery, dbGet } from './db.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set("trust proxy", 1);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize DB schemas
initDb();

// -----------------------------------------
// CRM API: Auth
// -----------------------------------------run this
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(`🔑 Login attempt: ${email}`);
        const user = await dbGet('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);
        if (user) {
            // Remove password from response
            const { password, ...safeUser } = user;
            res.json({ success: true, user: safeUser });
        } else {
            res.status(401).json({ success: false, error: 'Invalid email or password' });
        }
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/users', async (req, res) => {
    try {
        const users = await dbQuery('SELECT id, name, email, role, status, initials, color, createdAt, clientId, permissions FROM users');
        res.json(users);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/users', async (req, res) => {
    try {
        const { name, email, role, assignedClientIds, clientId, permissions } = req.body;
        const id = `u_${Date.now()}`;
        const password = req.body.password || 'dsignxt123'; // Custom password or default
        const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
        const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        const defaultPerms = JSON.stringify(['dashboard', 'clients', 'leads', 'pipeline', 'integrations', 'analytics', 'team', 'settings']);
        const finalPerms = permissions ? JSON.stringify(permissions) : defaultPerms;

        await dbRun(
            `INSERT INTO users (id, name, email, password, role, initials, color, clientId, permissions) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, name, email, password, role, initials, color, clientId || null, finalPerms]
        );

        // Update assigned clients
        if (assignedClientIds && assignedClientIds.length > 0) {
            for (const clientId of assignedClientIds) {
                const client = await dbGet('SELECT assignedUsers FROM clients WHERE id = ?', [clientId]);
                let assignedUsers = client.assignedUsers ? JSON.parse(client.assignedUsers) : [];
                if (!assignedUsers.includes(id)) {
                    assignedUsers.push(id);
                    await dbRun('UPDATE clients SET assignedUsers = ? WHERE id = ?', [JSON.stringify(assignedUsers), clientId]);
                }
            }
        }

        res.status(201).json(await dbGet('SELECT id, name, email, role, status, initials, color, createdAt, clientId, permissions FROM users WHERE id = ?', [id]));
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.patch('/api/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const existing = await dbGet('SELECT * FROM users WHERE id = ?', [id]);
        if (!existing) return res.status(404).json({ error: 'User not found' });

        const name = req.body.name ?? existing.name;
        const email = req.body.email ?? existing.email;
        const password = req.body.password ?? existing.password;
        const role = req.body.role ?? existing.role;
        const status = req.body.status ?? existing.status;
        const permissions = req.body.permissions ? JSON.stringify(req.body.permissions) : existing.permissions;

        await dbRun(
            `UPDATE users SET name = ?, email = ?, password = ?, role = ?, status = ?, permissions = ? WHERE id = ?`,
            [name, email, password, role, status, permissions, id]
        );

        res.json(await dbGet('SELECT id, name, email, role, status, initials, color, createdAt, clientId, permissions FROM users WHERE id = ?', [id]));
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// -----------------------------------------
// CRM API: Clients
// -----------------------------------------
app.get('/api/clients', async (req, res) => {
    try {
        const clients = await dbQuery('SELECT * FROM clients');
        res.json(clients);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/clients', async (req, res) => {
    try {
        const { name, industry, contactEmail, color, initials } = req.body;
        const id = `c_${Date.now()}`;
        await dbRun(
            `INSERT INTO clients (id, name, industry, contactEmail, color, initials) VALUES (?, ?, ?, ?, ?, ?)`,
            [id, name, industry, contactEmail, color, initials]
        );
        res.status(201).json(await dbGet('SELECT * FROM clients WHERE id = ?', [id]));
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.patch('/api/clients/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const existing = await dbGet('SELECT * FROM clients WHERE id = ?', [id]);
        if (!existing) return res.status(404).json({ error: 'Client not found' });

        const name = req.body.name ?? existing.name;
        const industry = req.body.industry ?? existing.industry;
        const contactEmail = req.body.contactEmail ?? existing.contactEmail;
        const status = req.body.status ?? existing.status;
        const notes = req.body.notes ?? existing.notes;
        const customFields = req.body.customFields ? JSON.stringify(req.body.customFields) : existing.customFields;

        await dbRun(
            `UPDATE clients SET name = ?, industry = ?, contactEmail = ?, status = ?, customFields = ?, notes = ? WHERE id = ?`,
            [name, industry, contactEmail, status, customFields, notes, id]
        );

        res.json(await dbGet('SELECT * FROM clients WHERE id = ?', [id]));
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// -----------------------------------------
// CRM API: Integrations
// -----------------------------------------
app.get('/api/integrations', async (req, res) => {
    try {
        res.json(await dbQuery('SELECT * FROM integrations'));
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/integrations', async (req, res) => {
    try {
        const { clientId, type, label, platform } = req.body;
        const id = `int_${Date.now()}`;
        const webhookKey = `wk_${Date.now().toString(36)}`;
        const baseUrl = process.env.NODE_ENV === 'production' ? `${req.protocol}://${req.get('host')}` : 'http://localhost:3001';
        const webhookUrl = `${baseUrl}/api/webhooks/${webhookKey}`;
        await dbRun(
            `INSERT INTO integrations (id, clientId, type, label, webhookKey, webhookUrl, platform) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [id, clientId, type, label, webhookKey, webhookUrl, platform]
        );
        res.status(201).json(await dbGet('SELECT * FROM integrations WHERE id = ?', [id]));
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// -----------------------------------------
// CRM API: Leads
// -----------------------------------------
app.get('/api/leads', async (req, res) => {
    try {
        res.json(await dbQuery('SELECT * FROM leads ORDER BY createdAt DESC'));
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// -----------------------------------------
// EXTERNAL INGESTION: Webhooks
// -----------------------------------------
const handleWebhook = async (req, res) => {
    try {
        const key = req.params.key;
        // Find integration by key
        const integration = await dbGet('SELECT * FROM integrations WHERE webhookKey = ?', [key]);
        if (!integration) return res.status(401).json({ error: 'Invalid or revoked Webhook Key.' });

        // Map payload fields (generic simple mapping)
        const payload = req.body || {};
        const fullName = payload.name || payload.fullName || payload.first_name || 'Unknown Lead';
        const email = payload.email || payload.mail || '';
        const phone = payload.phone || payload.mobile || '';

        const leadId = `l_${Date.now()}`;
        await dbRun(
            `INSERT INTO leads (id, clientId, integrationId, fullName, email, phone, sourceType, sourceLabel, customData) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [leadId, integration.clientId, integration.id, fullName, email, phone, integration.type, integration.label, JSON.stringify(payload)]
        );

        // Update integration total
        await dbRun(`UPDATE integrations SET leadsTotal = leadsTotal + 1, lastSync = CURRENT_TIMESTAMP WHERE id = ?`, [integration.id]);

        console.log(`✅ Lead Ingested: ${fullName} (${email}) for Client ${integration.clientId}`);

        res.status(201).json({ success: true, message: 'Lead recorded.', id: leadId });
    } catch (e) {
        console.error('Webhook error:', e);
        res.status(500).json({ error: e.message });
    }
};

app.post('/api/webhooks/:key', handleWebhook);
app.post('/api/ingest/:key', handleWebhook);

// Unified Production Serve
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../dist')));
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../dist', 'index.html'));
    });
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 DSignXT Backend running on http://localhost:${PORT}`);
});
