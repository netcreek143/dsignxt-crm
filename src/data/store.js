import { create } from 'zustand';
import { CLIENTS, LEADS, LEAD_SOURCES, INTEGRATIONS, USERS, STATUSES, TAGS, NOTIFICATIONS, FOLLOW_UPS, LEAD_NOTES, ACTIVITIES, SYNC_LOGS, WEBSITES, AGENCY, CLIENT_TABLE_CONFIGS } from './mockData';

const useStore = create((set, get) => ({
    // Core data
    agency: AGENCY,
    clients: [], // Starts empty, filled from DB
    leads: [],   // Starts empty, filled from DB
    sources: [], // Starts empty, filled from DB
    integrations: [], // Starts empty, filled from DB
    users: [],
    statuses: STATUSES,
    tags: TAGS,
    notifications: [],
    followUps: [],
    notes: [],
    activities: [],
    syncLogs: [],
    websites: [],
    tableConfigs: CLIENT_TABLE_CONFIGS,

    // UI state
    currentUser: null,
    isAuth: false,
    sidebarCollapsed: false,
    searchQuery: '',
    aiMessages: [], // { role: 'user' | 'assistant', content: string }
    isAiLoading: false,

    // Actions
    login: async (email, password) => {
        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                set({ currentUser: data.user, isAuth: true, selectedClientId: data.user.role === 'client' ? data.user.clientId : get().selectedClientId });
                return { success: true };
            }
            return { success: false, error: data.error || 'Login failed' };
        } catch (e) {
            return { success: false, error: 'Connection error' };
        }
    },
    logout: () => set({ currentUser: null, isAuth: false }),
    fetchUsersFromDb: async () => {
        try {
            const res = await fetch('/api/users');
            if (res.ok) {
                const dbUsers = await res.json();
                set({ users: dbUsers });
            }
        } catch (e) { console.log('Error creating user', e); throw e; }
    },

    updateUserInDb: async (id, data) => {
        try {
            const res = await fetch(`/api/users/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (res.ok) {
                const updatedTarget = await res.json();
                set(s => ({
                    users: s.users.map(u => u.id === id ? updatedTarget : u)
                }));
                return updatedTarget;
            }
            throw new Error('Failed to update user');
        } catch (e) { console.log('Error updating user', e); throw e; }
    },

    // Actions
    setSelectedClient: (id) => set({ selectedClientId: id }),
    toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
    setSearchQuery: (q) => set({ searchQuery: q }),

    // Computed getters
    getClient: (id) => get().clients.find(c => c.id === id),
    getUser: (id) => get().users.find(u => u.id === id),
    getSource: (id) => get().sources.find(s => s.id === id),

    getFilteredLeads: (filters = {}) => {
        let leads = get().leads;
        const currentUser = get().currentUser;
        
        const { sourceType, statusId, priority, temperature, assignedTo, search, dateFrom, dateTo, tags } = filters;
        // Force clientId if client role
        const selClient = currentUser?.role === 'client' ? currentUser.clientId : (filters.clientId !== undefined ? filters.clientId : get().selectedClientId);
        
        if (selClient) leads = leads.filter(l => l.clientId === selClient);
        if (sourceType) leads = leads.filter(l => l.sourceType === sourceType);
        if (statusId) leads = leads.filter(l => l.statusId === statusId);
        if (priority) leads = leads.filter(l => l.priority === priority);
        if (temperature) leads = leads.filter(l => l.temperature === temperature);
        if (assignedTo) leads = leads.filter(l => l.assignedTo === assignedTo);
        if (dateFrom) leads = leads.filter(l => new Date(l.createdAt) >= new Date(dateFrom));
        if (dateTo) leads = leads.filter(l => new Date(l.createdAt) <= new Date(dateTo));
        if (search) {
            const q = search.toLowerCase();
            leads = leads.filter(l =>
                l.fullName.toLowerCase().includes(q) || l.email.toLowerCase().includes(q) ||
                l.phone.includes(q) || (l.company && l.company.toLowerCase().includes(q)) ||
                l.sourceLabel.toLowerCase().includes(q) || (l.campaign && l.campaign.toLowerCase().includes(q))
            );
        }
        return leads;
    },

    getLeadsByStatus: (clientId) => {
        const currentUser = get().currentUser;
        const targetClientId = currentUser?.role === 'client' ? currentUser.clientId : clientId;
        const leads = targetClientId ? get().leads.filter(l => l.clientId === targetClientId) : get().leads;
        const groups = {};
        get().statuses.forEach(s => { groups[s.id] = []; });
        leads.forEach(l => { if (groups[l.statusId]) groups[l.statusId].push(l); });
        return groups;
    },

    getClientStats: (clientId) => {
        const leads = get().leads.filter(l => l.clientId === clientId);
        const today = new Date().toDateString();
        return {
            total: leads.length,
            new: leads.filter(l => l.statusId === 's1').length,
            today: leads.filter(l => new Date(l.createdAt).toDateString() === today).length,
            won: leads.filter(l => l.statusId === 's6').length,
            website: leads.filter(l => l.sourceType === 'website').length,
            meta: leads.filter(l => l.sourceType === 'meta').length,
            google: leads.filter(l => l.sourceType === 'google_ads').length,
            manual: leads.filter(l => l.sourceType === 'manual').length,
        };
    },

    getOverallStats: () => {
        const { leads, followUps, currentUser } = get();
        const today = new Date().toDateString();
        // If client, filter to their leads only for overall stats
        const activeLeads = currentUser?.role === 'client' ? leads.filter(l => l.clientId === currentUser.clientId) : leads;
        
        return {
            totalLeads: activeLeads.length,
            newToday: activeLeads.filter(l => new Date(l.createdAt).toDateString() === today).length,
            newThisWeek: activeLeads.filter(l => (Date.now() - new Date(l.createdAt)) < 7 * 86400000).length,
            followUpsDue: followUps.filter(f => !f.isCompleted && new Date(f.dueDate) <= new Date()).length,
            won: activeLeads.filter(l => l.statusId === 's6').length,
            conversionRate: activeLeads.length ? Math.round((activeLeads.filter(l => l.statusId === 's6').length / activeLeads.length) * 100) : 0,
            bySource: {
                website: activeLeads.filter(l => l.sourceType === 'website').length,
                meta: activeLeads.filter(l => l.sourceType === 'meta').length,
                google_ads: activeLeads.filter(l => l.sourceType === 'google_ads').length,
                manual: activeLeads.filter(l => l.sourceType === 'manual').length,
            },
            byClient: get().clients.map(c => ({
                clientId: c.id, name: c.name, color: c.color,
                count: activeLeads.filter(l => l.clientId === c.id).length,
            })),
            byStatus: get().statuses.map(s => ({
                statusId: s.id, label: s.label, color: s.color,
                count: activeLeads.filter(l => l.statusId === s.id).length,
            })),
            hotLeads: activeLeads.filter(l => l.temperature === 'hot').length,
        };
    },

    // Mutations
    updateLeadStatus: (leadId, statusId) => set(s => ({
        leads: s.leads.map(l => l.id === leadId ? { ...l, statusId, updatedAt: new Date().toISOString() } : l),
        activities: [...s.activities, {
            id: `act_${Date.now()}`, leadId, userId: s.currentUser.id, type: 'status_changed',
            description: `Status changed to ${s.statuses.find(st => st.id === statusId)?.label}`, createdAt: new Date().toISOString()
        }]
    })),

    updateLeadAssignee: (leadId, userId) => set(s => ({
        leads: s.leads.map(l => l.id === leadId ? { ...l, assignedTo: userId, updatedAt: new Date().toISOString() } : l),
    })),

    addLeadNote: (leadId, content) => set(s => ({
        notes: [...s.notes, {
            id: `n_${Date.now()}`, leadId, userId: s.currentUser.id, content, createdAt: new Date().toISOString()
        }],
        activities: [...s.activities, {
            id: `act_${Date.now()}`, leadId, userId: s.currentUser.id, type: 'note_added',
            description: 'Note added', createdAt: new Date().toISOString()
        }]
    })),

    // Database Sync Actions
    fetchClientsFromDb: async () => {
        try {
            const res = await fetch('/api/clients');
            if (res.ok) {
                const dbClients = await res.json();
                if (dbClients.length > 0) set({ clients: dbClients });
            }
        } catch (e) { console.log('Backend not available, using mock data for clients.'); }
    },

    fetchIntegrationsFromDb: async () => {
        try {
            const res = await fetch('/api/integrations');
            if (res.ok) {
                const dbInts = await res.json();
                if (dbInts.length > 0) {
                    set({
                        integrations: dbInts,
                        sources: dbInts.map(i => ({
                            id: i.id, // We use the same ID for simplicity in this mapping
                            clientId: i.clientId,
                            type: i.type,
                            label: i.label,
                            isActive: i.status === 'connected'
                        }))
                    });
                }
            }
        } catch (e) { console.log('Backend not available, using mock data for integrations.'); }
    },

    fetchLeadsFromDb: async () => {
        try {
            const res = await fetch('/api/leads');
            if (res.ok) {
                const dbLeads = await res.json();
                if (dbLeads.length > 0) set({ leads: dbLeads });
            }
        } catch (e) { console.log('Backend not available, using mock data for leads.'); }
    },

    createIntegrationInDb: async (integrationData) => {
        try {
            const res = await fetch('/api/integrations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(integrationData)
            });
            if (res.ok) {
                const newInt = await res.json();
                set(s => ({ integrations: [...s.integrations, newInt] }));
                return newInt;
            }
        } catch (e) { console.log('Backend error creating integration.'); }

        // Fallback
        const newInt = { ...integrationData, id: `int_${Date.now()}`, lastSync: new Date().toISOString(), leadsTotal: 0 };
        set(s => ({ integrations: [...s.integrations, newInt] }));
        return newInt;
    },

    createClientInDb: async (clientData) => {
        try {
            const res = await fetch('/api/clients', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(clientData)
            });
            if (res.ok) {
                const newClient = await res.json();
                set(s => ({ clients: [...s.clients, newClient] }));
                return newClient;
            }
        } catch (e) { console.log('Backend error creating client.'); }

        // Fallback to local memory if API fails
        const newClient = { ...clientData, id: `c${Date.now()}`, agencyId: get().agency?.id || 'ag1', createdAt: new Date().toISOString() };
        set(s => ({ clients: [...s.clients, newClient] }));
        return newClient;
    },

    addClient: (client) => {
        get().createClientInDb(client);
    },

    createUserInDb: async (userData) => {
        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            if (res.ok) {
                const newUser = await res.json();
                set(s => ({ users: [...s.users, newUser] }));
                // Re-fetch clients to get updated assignedUsers
                get().fetchClientsFromDb();
                return newUser;
            }
        } catch (e) { console.log('Backend error creating user.'); }

        // Fallback
        const newUser = {
            ...userData,
            id: `u_${Date.now()}`,
            initials: userData.name.split(' ').map(n => n[0]).join('').toUpperCase(),
            color: '#6366f1',
            status: 'active',
            createdAt: new Date().toISOString()
        };
        set(s => ({ users: [...s.users, newUser] }));
        return newUser;
    },

    updateClient: (id, updates) => set(s => ({
        clients: s.clients.map(c => c.id === id ? { ...c, ...updates } : c)
    })),

    updateClientInDb: async (id, updates) => {
        try {
            const res = await fetch(`/api/clients/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            if (res.ok) {
                const updatedClient = await res.json();
                set(s => ({
                    clients: s.clients.map(c => c.id === id ? updatedClient : c)
                }));
                return updatedClient;
            }
        } catch (e) { console.log('Backend error updating client.'); }

        // Fallback
        set(s => ({
            clients: s.clients.map(c => c.id === id ? { ...c, ...updates } : c)
        }));
    },

    addSource: (source) => {
        const id = `ls_${Date.now()}`;
        set(s => ({ sources: [...s.sources, { ...source, id, isActive: true }] }));
        return id;
    },

    addIntegration: (integration) => {
        return get().createIntegrationInDb(integration);
    },

    ingestTestLead: (sourceId, integrationId) => set(s => {
        const source = s.sources.find(src => src.id === sourceId);
        const newLead = {
            id: `l_${Date.now()}`,
            clientId: source.clientId,
            fullName: `Test Lead ${Math.floor(Math.random() * 1000)}`,
            email: `test${Math.floor(Math.random() * 1000)}@example.com`,
            phone: `+1555${Math.floor(Math.random() * 900000) + 100000}`,
            sourceType: source.type,
            sourceLabel: source.label,
            statusId: 's1', // New
            temperature: 'warm',
            priority: 'medium',
            assignedTo: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            campaign: source.type === 'google_ads' || source.type === 'meta' ? 'Test Campaign' : null,
            customData: {}
        };

        return {
            leads: [newLead, ...s.leads],
            integrations: s.integrations.map(i => i.id === integrationId ? { ...i, leadsTotal: i.leadsTotal + 1, lastSync: new Date().toISOString() } : i),
            syncLogs: [{
                id: `sync_${Date.now()}`, integrationId, status: 'success', leadsSynced: 1, error: null, startedAt: new Date().toISOString(), completedAt: new Date().toISOString()
            }, ...s.syncLogs]
        };
    }),

    markNotificationRead: (id) => set(s => ({
        notifications: s.notifications.map(n => n.id === id ? { ...n, isRead: true } : n)
    })),

    addFollowUp: (followUp) => set(s => ({
        followUps: [...s.followUps, { ...followUp, id: `f_${Date.now()}`, userId: s.currentUser.id, isCompleted: false, createdAt: new Date().toISOString() }]
    })),

    completeFollowUp: (id) => set(s => ({
        followUps: s.followUps.map(f => f.id === id ? { ...f, isCompleted: true } : f)
    })),

    getLeadNotes: (leadId) => get().notes.filter(n => n.leadId === leadId),
    getLeadActivities: (leadId) => get().activities.filter(a => a.leadId === leadId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    getClientWebsites: (clientId) => get().websites.filter(w => w.clientId === clientId),
    getClientSources: (clientId) => get().sources.filter(s => s.clientId === clientId),
    getSourceIntegration: (sourceId) => get().integrations.find(i => i.sourceId === sourceId),
    getUnreadNotifications: () => get().notifications.filter(n => !n.isRead),

    // AI Actions
    sendAiChat: async (message) => {
        const { currentUser, aiMessages } = get();
        const newMessage = { role: 'user', content: message };
        set({ aiMessages: [...aiMessages, newMessage], isAiLoading: true });

        try {
            const res = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: message, userId: currentUser.id })
            });
            const data = await res.json();
            if (res.ok) {
                set(s => ({ 
                    aiMessages: [...s.aiMessages, { role: 'assistant', content: data.response }],
                    isAiLoading: false 
                }));
            } else {
                set(s => ({ 
                    aiMessages: [...s.aiMessages, { role: 'assistant', content: `Error: ${data.error}` }],
                    isAiLoading: false 
                }));
            }
        } catch (e) {
            set(s => ({ 
                aiMessages: [...s.aiMessages, { role: 'assistant', content: 'Connection error' }],
                isAiLoading: false 
            }));
        }
    },

    analyzeLead: async (leadId) => {
        try {
            const res = await fetch(`/api/ai/analyze-lead/${leadId}`, { method: 'POST' });
            const data = await res.json();
            if (res.ok) {
                set(s => ({
                    leads: s.leads.map(l => l.id === leadId ? { ...l, aiAnalysis: data.analysis } : l)
                }));
                return data.analysis;
            }
        } catch (e) { console.error('AI Analysis failed', e); }
        return null;
    },

    clearAiChat: () => set({ aiMessages: [] }),
}));

export default useStore;
