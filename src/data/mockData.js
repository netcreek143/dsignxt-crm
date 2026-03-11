// DSignXT CRM — Mock Data
const now = new Date();
const d = (daysAgo) => new Date(now - daysAgo * 86400000).toISOString();

export const STATUSES = [
    { id: 's1', label: 'New', color: '#3b82f6', position: 1 },
    { id: 's2', label: 'Contacted', color: '#6366f1', position: 2 },
    { id: 's3', label: 'Follow-up Pending', color: '#f59e0b', position: 3 },
    { id: 's4', label: 'Qualified', color: '#10b981', position: 4 },
    { id: 's5', label: 'Proposal Sent', color: '#8b5cf6', position: 5 },
    { id: 's6', label: 'Won', color: '#059669', position: 6 },
    { id: 's7', label: 'Lost', color: '#ef4444', position: 7 },
    { id: 's8', label: 'Not Interested', color: '#6b7280', position: 8 },
    { id: 's9', label: 'Invalid Lead', color: '#991b1b', position: 9 },
];

export const USERS = [
    { id: 'u1', name: 'Suriya', email: 'suriya@dsignxt.com', role: 'super_admin', avatar: null, initials: 'S', color: '#6366f1', status: 'active' },
    { id: 'u2', name: 'Prasanth', email: 'prasanth@dsignxt.com', role: 'admin', avatar: null, initials: 'P', color: '#8b5cf6', status: 'active' },
    { id: 'u3', name: 'Viknesh', email: 'viknesh@dsignxt.com', role: 'manager', avatar: null, initials: 'V', color: '#ec4899', status: 'active' },
    { id: 'u4', name: 'Charan', email: 'charan@dsignxt.com', role: 'executive', avatar: null, initials: 'C', color: '#f59e0b', status: 'active' },
    { id: 'u5', name: 'Nivetha', email: 'nivetha@dsignxt.com', role: 'executive', avatar: null, initials: 'N', color: '#10b981', status: 'active' },
    { id: 'u6', name: 'Client User', email: 'client@vireka.in', role: 'client', avatar: null, initials: 'C', color: '#059669', status: 'active', clientId: 'c1' },
];

export const AGENCY = {
    id: 'a1', name: 'DSignXT Digital', logo: null, domain: 'dsignxt.com',
    plan: 'professional', settings: {}, createdAt: d(365)
};

export const CLIENTS = [
    {
        id: 'c1', agencyId: 'a1', name: 'Vireka Ecosystem', brand: 'Vireka', logo: null, initials: 'VE', color: '#059669',
        industry: 'Technology', contactEmail: 'hello@vireka.in', contactPhone: '+91 98765 43210',
        notes: 'Premium tech client, multiple web properties', status: 'active',
        assignedUsers: ['u1', 'u3'], createdAt: d(180)
    },
    {
        id: 'c2', agencyId: 'a1', name: 'GreenLeaf Organics', brand: 'GreenLeaf', logo: null, initials: 'GL', color: '#10b981',
        industry: 'E-commerce', contactEmail: 'info@greenleaf.com', contactPhone: '+91 87654 32109',
        notes: 'Organic food brand, heavy Meta ads', status: 'active',
        assignedUsers: ['u2', 'u4'], createdAt: d(120)
    },
    {
        id: 'c3', agencyId: 'a1', name: 'UrbanNest Interiors', brand: 'UrbanNest', logo: null, initials: 'UN', color: '#f59e0b',
        industry: 'Interior Design', contactEmail: 'hello@urbannest.in', contactPhone: '+91 76543 21098',
        notes: 'Interior design studio, Google Ads + website leads', status: 'active',
        assignedUsers: ['u3', 'u5'], createdAt: d(90)
    },
    {
        id: 'c4', agencyId: 'a1', name: 'FitZone Gym', brand: 'FitZone', logo: null, initials: 'FZ', color: '#ef4444',
        industry: 'Fitness', contactEmail: 'admin@fitzone.in', contactPhone: '+91 65432 10987',
        notes: 'Gym chain, Meta lead ads focus', status: 'active',
        assignedUsers: ['u4', 'u5'], createdAt: d(60)
    },
];

export const WEBSITES = [
    { id: 'w1', clientId: 'c1', domain: 'vireka.in', name: 'Main Website', isActive: true, createdAt: d(170) },
    { id: 'w2', clientId: 'c1', domain: 'virekaecosystem.com', name: 'Ecosystem Portal', isActive: true, createdAt: d(150) },
    { id: 'w3', clientId: 'c2', domain: 'greenleaf.com', name: 'Main Store', isActive: true, createdAt: d(115) },
    { id: 'w4', clientId: 'c3', domain: 'urbannest.in', name: 'Portfolio Site', isActive: true, createdAt: d(85) },
    { id: 'w5', clientId: 'c4', domain: 'fitzone.in', name: 'Landing Page', isActive: true, createdAt: d(55) },
];

export const LEAD_SOURCES = [
    { id: 'ls1', clientId: 'c1', type: 'website', label: 'Vireka Contact Form', websiteId: 'w1', isActive: true },
    { id: 'ls2', clientId: 'c1', type: 'meta', label: 'Vireka Meta Leads', metaPageId: 'pg_vireka', isActive: true },
    { id: 'ls3', clientId: 'c1', type: 'google_ads', label: 'Vireka Google Ads', isActive: true },
    { id: 'ls4', clientId: 'c2', type: 'website', label: 'GreenLeaf Contact', websiteId: 'w3', isActive: true },
    { id: 'ls5', clientId: 'c2', type: 'meta', label: 'GreenLeaf Instagram Ads', metaPageId: 'pg_greenleaf', isActive: true },
    { id: 'ls6', clientId: 'c3', type: 'website', label: 'UrbanNest Enquiry Form', websiteId: 'w4', isActive: true },
    { id: 'ls7', clientId: 'c3', type: 'google_ads', label: 'UrbanNest Search Ads', isActive: true },
    { id: 'ls8', clientId: 'c3', type: 'meta', label: 'UrbanNest Facebook Ads', metaPageId: 'pg_urbannest', isActive: true },
    { id: 'ls9', clientId: 'c4', type: 'meta', label: 'FitZone Lead Ads', metaPageId: 'pg_fitzone', isActive: true },
    { id: 'ls10', clientId: 'c4', type: 'website', label: 'FitZone Landing Page', websiteId: 'w5', isActive: true },
    { id: 'ls11', clientId: 'c4', type: 'google_ads', label: 'FitZone Google PPC', isActive: true },
];

export const INTEGRATIONS = [
    { id: 'int1', sourceId: 'ls1', platform: 'website', status: 'connected', apiKey: 'wk_vireka_a1b2c3', webhookUrl: 'https://api.dsignxtcrm.com/ingest/wk_vireka_a1b2c3', lastSync: d(0), leadsTotal: 45 },
    { id: 'int2', sourceId: 'ls2', platform: 'meta', status: 'connected', metaPageName: 'Vireka Tech', metaFormName: 'Get a Quote', lastSync: d(0), leadsTotal: 32 },
    { id: 'int3', sourceId: 'ls3', platform: 'google_ads', status: 'connected', googleAccountName: 'Vireka - Search', lastSync: d(0), leadsTotal: 28 },
    { id: 'int4', sourceId: 'ls4', platform: 'website', status: 'connected', apiKey: 'wk_greenleaf_d4e5f6', webhookUrl: 'https://api.dsignxtcrm.com/ingest/wk_greenleaf_d4e5f6', lastSync: d(0), leadsTotal: 38 },
    { id: 'int5', sourceId: 'ls5', platform: 'meta', status: 'connected', metaPageName: 'GreenLeaf Organics', metaFormName: 'Shop Now Lead', lastSync: d(1), leadsTotal: 52 },
    { id: 'int6', sourceId: 'ls6', platform: 'website', status: 'connected', apiKey: 'wk_urbannest_g7h8i9', webhookUrl: 'https://api.dsignxtcrm.com/ingest/wk_urbannest_g7h8i9', lastSync: d(0), leadsTotal: 22 },
    { id: 'int7', sourceId: 'ls7', platform: 'google_ads', status: 'connected', googleAccountName: 'UrbanNest - Interiors', lastSync: d(0), leadsTotal: 18 },
    { id: 'int8', sourceId: 'ls8', platform: 'meta', status: 'warning', metaPageName: 'UrbanNest Design', metaFormName: 'Free Consultation', lastSync: d(3), leadsTotal: 15 },
    { id: 'int9', sourceId: 'ls9', platform: 'meta', status: 'connected', metaPageName: 'FitZone Gym', metaFormName: 'Join Now', lastSync: d(0), leadsTotal: 67 },
    { id: 'int10', sourceId: 'ls10', platform: 'website', status: 'connected', apiKey: 'wk_fitzone_j1k2l3', webhookUrl: 'https://api.dsignxtcrm.com/ingest/wk_fitzone_j1k2l3', lastSync: d(0), leadsTotal: 19 },
    { id: 'int11', sourceId: 'ls11', platform: 'google_ads', status: 'connected', googleAccountName: 'FitZone - Local', lastSync: d(1), leadsTotal: 24 },
];

const names = [
    ['Aditi', 'Verma'], ['Rohit', 'Patel'], ['Sneha', 'Iyer'], ['Karthik', 'Nair'], ['Meena', 'Reddy'],
    ['Amit', 'Shah'], ['Divya', 'Kumar'], ['Rajesh', 'Gupta'], ['Ananya', 'Singh'], ['Vikram', 'Joshi'],
    ['Pooja', 'Mehta'], ['Suresh', 'Pillai'], ['Kavita', 'Rao'], ['Nikhil', 'Menon'], ['Lakshmi', 'Das'],
    ['Arjun', 'Bhat'], ['Swati', 'Agarwal'], ['Manoj', 'Hegde'], ['Ritika', 'Choudhary'], ['Sanjay', 'Kulkarni'],
    ['Neha', 'Pandey'], ['Arun', 'Srinivasan'], ['Pallavi', 'Saxena'], ['Gaurav', 'Mishra'], ['Ranjini', 'Nambiar'],
    ['Deepak', 'Tiwari'], ['Shreya', 'Banerjee'], ['Harish', 'Venkatesh'], ['Anu', 'Krishnan'], ['Siddharth', 'Malhotra'],
    ['Sunita', 'Kapoor'], ['Pranav', 'Deshmukh'], ['Madhavi', 'Rane'], ['Girish', 'Shastri'], ['Tanya', 'Gopal'],
    ['Vijay', 'Narayan'], ['Jyoti', 'Thakur'], ['Prasad', 'Sundaram'], ['Bhavna', 'Chauhan'], ['Ashwin', 'Murthy'],
    ['Rekha', 'Kamath'], ['Tarun', 'Dhawan'], ['Aparna', 'Shetty'], ['Naveen', 'Khanna'], ['Chitra', 'Rajan'],
    ['Milind', 'Jain'], ['Smita', 'Bose'], ['Hari', 'Narayanan'], ['Vani', 'Subramanian'], ['Kunal', 'Oberoi'],
];

const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata', 'Ahmedabad', 'Kochi', 'Jaipur'];
const campaigns = ['Brand Awareness Q1', 'Lead Gen March', 'Summer Sale', 'Free Consultation', 'Get a Quote', 'Spring Promo', 'Join Now', 'Website Visitors', 'Retargeting', 'Local Search'];
const adSets = ['Lookalike 1%', 'Interest - Tech', 'Age 25-40', 'Custom Audience', 'Broad Targeting', 'Location Based'];
const forms = ['Contact Form', 'Enquiry Form', 'Get Quote', 'Book Now', 'Free Trial', 'Newsletter', 'Consultation Request'];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randPhone() { return `+91 ${Math.floor(Math.random() * 90000 + 10000)} ${Math.floor(Math.random() * 90000 + 10000)}`; }
function randEmail(fn, ln) { return `${fn.toLowerCase()}.${ln.toLowerCase()}@${pick(['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'])}`; }

function generateLeads() {
    const leads = [];
    const temps = ['hot', 'warm', 'cold'];
    const priorities = ['high', 'medium', 'low'];
    const sourceMap = { c1: ['ls1', 'ls2', 'ls3'], c2: ['ls4', 'ls5'], c3: ['ls6', 'ls7', 'ls8'], c4: ['ls9', 'ls10', 'ls11'] };

    let id = 1;
    for (const [clientId, sourceIds] of Object.entries(sourceMap)) {
        const count = clientId === 'c2' ? 18 : clientId === 'c4' ? 20 : 15;
        for (let i = 0; i < count; i++) {
            const [fn, ln] = names[(id - 1) % names.length];
            const sourceId = pick(sourceIds);
            const source = LEAD_SOURCES.find(s => s.id === sourceId);
            const statusId = pick(STATUSES).id;
            const daysAgo = Math.floor(Math.random() * 45);
            leads.push({
                id: `lead_${id}`, clientId, sourceId, sourceType: source.type,
                firstName: fn, lastName: ln, fullName: `${fn} ${ln}`,
                email: randEmail(fn, ln), phone: randPhone(), altPhone: Math.random() > 0.7 ? randPhone() : '',
                company: Math.random() > 0.5 ? `${fn}'s ${pick(['Solutions', 'Enterprises', 'Corp', 'Studio', 'Labs'])}` : '',
                city: pick(cities), state: 'Tamil Nadu', country: 'India',
                statusId, priority: pick(priorities), temperature: pick(temps),
                assignedTo: pick(USERS).id,
                campaign: source.type !== 'website' ? pick(campaigns) : '',
                adSet: source.type === 'meta' ? pick(adSets) : '',
                adName: source.type === 'meta' ? `Ad ${Math.floor(Math.random() * 20 + 1)}` : '',
                formName: source.type === 'website' ? pick(forms) : '',
                platform: source.type, utmSource: source.type === 'google_ads' ? 'google' : source.type === 'meta' ? 'facebook' : 'direct',
                utmMedium: source.type === 'website' ? 'organic' : 'cpc',
                utmCampaign: source.type !== 'website' ? pick(campaigns) : '',
                sourceLabel: source.label, referrer: '', landingPage: '',
                tags: [], notes: [], customFields: {},
                rawPayload: { source: source.type, timestamp: d(daysAgo) },
                createdAt: d(daysAgo), updatedAt: d(Math.max(0, daysAgo - 2)),
                lastContactedAt: statusId !== 's1' ? d(Math.max(0, daysAgo - 1)) : null,
            });
            id++;
        }
    }
    return leads;
}

export const LEADS = generateLeads();

export const LEAD_NOTES = [
    { id: 'n1', leadId: 'lead_1', userId: 'u1', content: 'Interested in premium package. Follow up next week.', createdAt: d(2) },
    { id: 'n2', leadId: 'lead_1', userId: 'u3', content: 'Called and discussed requirements. Sending proposal.', createdAt: d(1) },
    { id: 'n3', leadId: 'lead_3', userId: 'u2', content: 'Budget is limited. Offered starter plan.', createdAt: d(5) },
    { id: 'n4', leadId: 'lead_5', userId: 'u4', content: 'Very responsive lead, schedule demo for Thursday.', createdAt: d(3) },
];

export const ACTIVITIES = [
    { id: 'act1', leadId: 'lead_1', userId: 'u1', type: 'created', description: 'Lead created from Vireka Contact Form', createdAt: d(10) },
    { id: 'act2', leadId: 'lead_1', userId: 'u1', type: 'status_changed', description: 'Status changed from New to Contacted', createdAt: d(8) },
    { id: 'act3', leadId: 'lead_1', userId: 'u3', type: 'note_added', description: 'Note added', createdAt: d(2) },
    { id: 'act4', leadId: 'lead_1', userId: 'u3', type: 'status_changed', description: 'Status changed to Follow-up Pending', createdAt: d(1) },
    { id: 'act5', leadId: 'lead_2', userId: 'u2', type: 'created', description: 'Lead imported from Meta Ads', createdAt: d(7) },
    { id: 'act6', leadId: 'lead_3', userId: 'u2', type: 'assigned', description: 'Assigned to Prasanth', createdAt: d(6) },
];

export const FOLLOW_UPS = [
    { id: 'f1', leadId: 'lead_1', userId: 'u1', dueDate: d(-1), type: 'call', notes: 'Follow up on proposal', isCompleted: false },
    { id: 'f2', leadId: 'lead_3', userId: 'u3', dueDate: d(0), type: 'email', notes: 'Send revised quote', isCompleted: false },
    { id: 'f3', leadId: 'lead_5', userId: 'u4', dueDate: d(1), type: 'call', notes: 'Schedule demo', isCompleted: false },
    { id: 'f4', leadId: 'lead_8', userId: 'u2', dueDate: d(-2), type: 'meeting', notes: 'On-site visit', isCompleted: true },
    { id: 'f5', leadId: 'lead_12', userId: 'u5', dueDate: d(0), type: 'call', notes: 'Confirm order details', isCompleted: false },
    { id: 'f6', leadId: 'lead_15', userId: 'u3', dueDate: d(2), type: 'email', notes: 'Send case studies', isCompleted: false },
];

export const TAGS = [
    { id: 't1', name: 'Hot Lead', color: '#ef4444' },
    { id: 't2', name: 'VIP', color: '#f59e0b' },
    { id: 't3', name: 'Enterprise', color: '#8b5cf6' },
    { id: 't4', name: 'SMB', color: '#3b82f6' },
    { id: 't5', name: 'Returning', color: '#10b981' },
    { id: 't6', name: 'Needs Nurturing', color: '#ec4899' },
];

export const NOTIFICATIONS = [
    { id: 'notif1', userId: 'u1', type: 'new_lead', title: 'New Lead', message: 'Aditi Verma from Vireka Contact Form', isRead: false, link: '/leads/lead_1', createdAt: d(0) },
    { id: 'notif2', userId: 'u1', type: 'follow_up', title: 'Follow-up Due', message: 'Follow up on proposal for Aditi Verma', isRead: false, link: '/leads/lead_1', createdAt: d(0) },
    { id: 'notif3', userId: 'u1', type: 'sync', title: 'Sync Complete', message: 'GreenLeaf Instagram Ads synced 5 new leads', isRead: true, link: '/integrations', createdAt: d(1) },
    { id: 'notif4', userId: 'u1', type: 'warning', title: 'Sync Warning', message: 'UrbanNest Facebook Ads connection needs attention', isRead: false, link: '/integrations', createdAt: d(2) },
];

export const SYNC_LOGS = [
    { id: 'sl1', integrationId: 'int2', status: 'success', leadsSynced: 3, error: null, startedAt: d(0), completedAt: d(0) },
    { id: 'sl2', integrationId: 'int5', status: 'success', leadsSynced: 5, error: null, startedAt: d(1), completedAt: d(1) },
    { id: 'sl3', integrationId: 'int8', status: 'warning', leadsSynced: 0, error: 'Token expiring soon', startedAt: d(3), completedAt: d(3) },
    { id: 'sl4', integrationId: 'int9', status: 'success', leadsSynced: 8, error: null, startedAt: d(0), completedAt: d(0) },
    { id: 'sl5', integrationId: 'int3', status: 'success', leadsSynced: 4, error: null, startedAt: d(0), completedAt: d(0) },
    { id: 'sl6', integrationId: 'int7', status: 'success', leadsSynced: 2, error: null, startedAt: d(1), completedAt: d(1) },
    { id: 'sl7', integrationId: 'int11', status: 'success', leadsSynced: 6, error: null, startedAt: d(1), completedAt: d(1) },
];

// Per-client custom table columns
export const CLIENT_TABLE_CONFIGS = {
    c1: {
        columns: ['fullName', 'email', 'phone', 'sourceType', 'campaign', 'statusId', 'temperature', 'assignedTo', 'createdAt'],
        customFields: [{ key: 'project_type', label: 'Project Type', type: 'select', options: ['Web App', 'Mobile App', 'SaaS', 'Consulting'] }]
    },
    c2: {
        columns: ['fullName', 'email', 'phone', 'sourceType', 'campaign', 'statusId', 'priority', 'assignedTo', 'createdAt'],
        customFields: [{ key: 'order_value', label: 'Est. Order Value', type: 'number' }, { key: 'product_interest', label: 'Product Interest', type: 'text' }]
    },
    c3: {
        columns: ['fullName', 'email', 'phone', 'sourceType', 'city', 'statusId', 'temperature', 'assignedTo', 'createdAt'],
        customFields: [{ key: 'property_type', label: 'Property Type', type: 'select', options: ['Apartment', 'Villa', 'Office', 'Retail'] }, { key: 'budget_range', label: 'Budget Range', type: 'text' }]
    },
    c4: {
        columns: ['fullName', 'email', 'phone', 'sourceType', 'campaign', 'statusId', 'assignedTo', 'createdAt'],
        customFields: [{ key: 'membership_type', label: 'Membership Interest', type: 'select', options: ['Monthly', 'Quarterly', 'Annual', 'Personal Training'] }]
    },
};
