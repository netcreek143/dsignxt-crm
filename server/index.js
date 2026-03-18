import 'dotenv/config';
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
        existing.aiChatEnabled = req.body.aiChatEnabled ?? existing.aiChatEnabled;
        existing.aiAnalysisEnabled = req.body.aiAnalysisEnabled ?? existing.aiAnalysisEnabled;

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
        const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
        const host = req.get('host');
        const baseUrl = `${protocol}://${host}`;
        const webhookUrl = `${baseUrl}/api/webhooks/${webhookKey}`;
        
        const newIntegration = new Integration({
            id, clientId, type, label, webhookKey, webhookUrl, platform
        });
        await newIntegration.save();
        res.status(201).json(await Integration.findOne({ id }).lean());
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// -----------------------------------------
// CRM API: AI & LLM
// -----------------------------------------
import { analyzeLead, getChatResponse } from './ai.js';

app.post('/api/ai/analyze-lead/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const lead = await Lead.findOne({ id });
        if (!lead) return res.status(404).json({ error: 'Lead not found' });

        const analysis = await analyzeLead(lead);
        lead.aiAnalysis = analysis;
        await lead.save();

        res.json({ success: true, analysis });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/ai/chat', async (req, res) => {
    try {
        const { query, userId } = req.body;
        const user = await User.findOne({ id: userId });
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Scoping leads based on role
        let leads;
        if (user.role === 'client') {
            leads = await Lead.find({ clientId: user.clientId }).lean();
            // Check if AI chat is enabled for this client
            const client = await Client.findOne({ id: user.clientId });
            if (!client || !client.aiChatEnabled) {
                return res.status(403).json({ error: 'AI features are disabled for your account.' });
            }
        } else {
            // Internal agency staff see all leads or filter by selected client if needed
            // For now, give them access to all leads in the chat context
            leads = await Lead.find({}).limit(50).sort({ createdAt: -1 }).lean();
        }

        const response = await getChatResponse(query, leads, user.role);
        res.json({ success: true, response });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/ai/status', (req, res) => {
    res.json({
        gemini: !!process.env.GEMINI_API_KEY,
        groq: !!process.env.GROQ_API_KEY,
        mistral: !!process.env.MISTRAL_API_KEY
    });
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

        const payload = { ...req.body };
        const fullName = payload.name || payload.fullName || payload.full_name || 'Unknown Lead';
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
            utm_source: payload.utm_source || '',
            utm_medium: payload.utm_medium || '',
            utm_campaign: payload.utm_campaign || '',
            utm_term: payload.utm_term || '',
            utm_content: payload.utm_content || '',
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

// Serve the ingestion script
app.get('/api/ingest.js', (req, res) => {
    const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
    const host = req.get('host');
    const baseUrl = `${protocol}://${host}`;

    res.setHeader('Content-Type', 'application/javascript');
    res.send(`
(function() {
    const script = document.currentScript;
    const key = script.getAttribute('data-key');
    if (!key) return console.error('DSignXT: data-key attribute is missing');
    
    const endpoint = "${baseUrl}/api/webhooks/" + key;

    window.addEventListener('submit', async (e) => {
        // Find if the submitted form contains our script or is the target
        const form = e.target;
        if (form.getAttribute('data-dsignxt-ignore')) return;

        const formData = new FormData(form);
        const data = {};
        formData.forEach((value, key) => { data[key] = value; });
        
        // Basic mapping for common fields
        const urlParams = new URLSearchParams(window.location.search);
        const payload = {
            name: data.name || data.fullName || data.full_name || '',
            email: data.email || data.email_address || '',
            phone: data.phone || data.tel || data.mobile || '',
            utm_source: urlParams.get('utm_source') || '',
            utm_medium: urlParams.get('utm_medium') || '',
            utm_campaign: urlParams.get('utm_campaign') || '',
            utm_term: urlParams.get('utm_term') || '',
            utm_content: urlParams.get('utm_content') || '',
            ...data
        };

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (response.ok) console.log('DSignXT: Lead ingested successfully');
        } catch (err) {
            console.error('DSignXT: Ingestion failed', err);
        }
    });
})();
    `);
});

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
