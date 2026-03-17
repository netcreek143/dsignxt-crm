import express from 'express';
import cors from 'cors';
import { connectDB, initMongoSeeds, User, Client, Integration, Lead } from './mongo.js';
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
// Initialize MongoDB
connectDB().then(() => {
    initMongoSeeds();
});

// -----------------------------------------
// CRM API: Auth
// -----------------------------------------run this
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(`🔑 Login attempt: ${email}`);
        const user = await User.findOne({ email, password }).lean();
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
        const users = await User.find({}, '-password').lean();
        res.json(users);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/users', async (req, res) => {
    try {
        const { name, email, role, assignedClientIds, clientId, permissions } = req.body;
        const id = `u_${Date.now()}`;
        const password = req.body.password || 'dsignxt123';
        const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
        const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        const defaultPerms = JSON.stringify(['dashboard', 'clients', 'leads', 'pipeline', 'integrations', 'analytics', 'team', 'settings']);
        const finalPerms = permissions ? JSON.stringify(permissions) : defaultPerms;

        const newUser = new User({
            id, name, email, password, role, initials, color, clientId: clientId || null, permissions: finalPerms
        });
        await newUser.save();

        if (assignedClientIds && assignedClientIds.length > 0) {
            for (const cId of assignedClientIds) {
                const client = await Client.findOne({ id: cId });
                if (client) {
                    let assignedUsers = client.assignedUsers ? JSON.parse(client.assignedUsers) : [];
                    if (!assignedUsers.includes(id)) {
                        assignedUsers.push(id);
                        client.assignedUsers = JSON.stringify(assignedUsers);
                        await client.save();
                    }
                }
            }
        }

        res.status(201).json(await User.findOne({ id }, '-password').lean());
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.patch('/api/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const existing = await User.findOne({ id });
        if (!existing) return res.status(404).json({ error: 'User not found' });

        existing.name = req.body.name ?? existing.name;
        existing.email = req.body.email ?? existing.email;
        existing.password = req.body.password ?? existing.password;
        existing.role = req.body.role ?? existing.role;
        existing.status = req.body.status ?? existing.status;
        existing.permissions = req.body.permissions ? JSON.stringify(req.body.permissions) : existing.permissions;

        await existing.save();

        res.json(await User.findOne({ id }, '-password').lean());
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// -----------------------------------------
// CRM API: Clients
// -----------------------------------------
app.get('/api/clients', async (req, res) => {
    try {
        const clients = await Client.find({}).lean();
        res.json(clients);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/clients', async (req, res) => {
    try {
        const { name, industry, contactEmail, color, initials } = req.body;
        const id = `c_${Date.now()}`;
        const newClient = new Client({
            id, name, industry, contactEmail, color, initials
        });
        await newClient.save();
        res.status(201).json(await Client.findOne({ id }).lean());
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.patch('/api/clients/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const existing = await Client.findOne({ id });
        if (!existing) return res.status(404).json({ error: 'Client not found' });

        existing.name = req.body.name ?? existing.name;
        existing.industry = req.body.industry ?? existing.industry;
        existing.contactEmail = req.body.contactEmail ?? existing.contactEmail;
        existing.status = req.body.status ?? existing.status;
        existing.notes = req.body.notes ?? existing.notes;
        existing.customFields = req.body.customFields ? JSON.stringify(req.body.customFields) : existing.customFields;

        await existing.save();

        res.json(await Client.findOne({ id }).lean());
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// -----------------------------------------
// CRM API: Integrations
// -----------------------------------------
app.get('/api/integrations', async (req, res) => {
    try {
        res.json(await Integration.find({}).lean());
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/integrations', async (req, res) => {
    try {
        const { clientId, type, label, platform } = req.body;
        const id = `int_${Date.now()}`;
        const webhookKey = `wk_${Date.now().toString(36)}`;
        const baseUrl = process.env.NODE_ENV === 'production' ? `${req.protocol}://${req.get('host')}` : 'http://localhost:3001';
        const webhookUrl = `${baseUrl}/api/webhooks/${webhookKey}`;
        
        const newIntegration = new Integration({
            id, clientId, type, label, webhookKey, webhookUrl, platform
        });
        await newIntegration.save();
        res.status(201).json(await Integration.findOne({ id }).lean());
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// -----------------------------------------
// CRM API: Leads
// -----------------------------------------
app.get('/api/leads', async (req, res) => {
    try {
        res.json(await Lead.find({}).sort({ createdAt: -1 }).lean());
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// -----------------------------------------
// EXTERNAL INGESTION: Webhooks
// -----------------------------------------
const handleWebhook = async (req, res) => {
    try {
        const key = req.params.key;
        const integration = await Integration.findOne({ webhookKey: key });
        if (!integration) return res.status(401).json({ error: 'Invalid or revoked Webhook Key.' });

        const payload = req.body || {};
        const fullName = payload.name || payload.fullName || payload.first_name || 'Unknown Lead';
        const email = payload.email || payload.mail || '';
        const phone = payload.phone || payload.mobile || '';

        const leadId = `l_${Date.now()}`;
        const newLead = new Lead({
            id: leadId,
            clientId: integration.clientId,
            integrationId: integration.id,
            fullName,
            email,
            phone,
            sourceType: integration.type,
            sourceLabel: integration.label,
            customData: JSON.stringify(payload)
        });
        await newLead.save();

        // Update integration total
        integration.leadsTotal += 1;
        integration.lastSync = new Date();
        await integration.save();

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
    
    // Bulletproof catch-all for SPAs in Express 5:
    // Use a middleware instead of a route to bypass path-to-regexp parsing issues
    app.use((req, res, next) => {
        if (req.method === 'GET' && !req.path.startsWith('/api')) {
            res.sendFile(path.resolve(__dirname, '../dist', 'index.html'));
        } else {
            next();
        }
    });
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 DSignXT Backend running on http://localhost:${PORT}`);
});
