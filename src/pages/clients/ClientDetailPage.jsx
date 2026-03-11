import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Globe, Facebook, Chrome, Users, Settings, Activity, Inbox, GitBranch, Plug } from 'lucide-react';
import useStore from '../../data/store';
import LeadsPage from '../leads/LeadsPage';
import PipelinePage from '../pipeline/PipelinePage';

export default function ClientDetailPage() {
    const { clientId } = useParams();
    const navigate = useNavigate();
    const { getClient, getClientStats, getClientWebsites, getClientSources, setSelectedClient, users, currentUser } = useStore();
    const client = getClient(clientId);
    const [activeTab, setActiveTab] = useState('overview');

    if (!client) return <div className="page-content"><p>Client not found</p></div>;

    const stats = getClientStats(clientId);
    const websites = getClientWebsites(clientId);
    const sources = getClientSources(clientId);

    // Set client filter when viewing this page
    React.useEffect(() => { setSelectedClient(clientId); return () => setSelectedClient(null); }, [clientId]);

    const tabs = [
        { key: 'overview', label: 'Overview', icon: Activity },
        { key: 'leads', label: 'Leads', icon: Inbox },
        { key: 'pipeline', label: 'Pipeline', icon: GitBranch },
        { key: 'integrations', label: 'Integrations', icon: Plug },
        { key: 'fields', label: 'Lead Fields', icon: Settings },
        { key: 'team', label: 'Team', icon: Users },
        { key: 'settings', label: 'Settings', icon: Settings },
    ];

    const [customFields, setCustomFields] = useState(
        client.customFields ? JSON.parse(typeof client.customFields === 'string' ? client.customFields : JSON.stringify(client.customFields)) : []
    );

    const [settingsForm, setSettingsForm] = useState({
        name: client.name || '',
        industry: client.industry || '',
        contactEmail: client.contactEmail || '',
        notes: client.notes || ''
    });

    const isSuperAdmin = currentUser?.role === 'super_admin';

    const handleSettingsChange = (field, value) => {
        setSettingsForm(prev => ({ ...prev, [field]: value }));
    };

    const handleAddField = () => {
        setCustomFields([...customFields, { key: '', label: '', type: 'text' }]);
    };

    const handleRemoveField = (index) => {
        setCustomFields(customFields.filter((_, i) => i !== index));
    };

    const handleFieldChange = (index, field, value) => {
        const next = [...customFields];
        next[index][field] = value;
        setCustomFields(next);
    };

    const { updateClientInDb } = useStore();
    const [saving, setSaving] = useState(false);

    const handleSaveFields = async () => {
        setSaving(true);
        // Clean up empty keys
        const cleanFields = customFields.filter(f => f.key.trim());
        await updateClientInDb(clientId, { customFields: cleanFields });
        setSaving(false);
        alert('Custom fields saved successfully!');
    };

    const handleSaveSettings = async () => {
        setSaving(true);
        try {
            await updateClientInDb(clientId, settingsForm);
            alert('Settings saved successfully!');
        } catch (error) {
            alert('Error saving settings');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="page-content">
            {/* Client Header */}
            <div className="client-detail-header">
                <button className="btn btn-ghost btn-sm" onClick={() => navigate('/clients')}><ArrowLeft size={16} /> Back</button>
                <div className="client-detail-info">
                    <div className="client-card-avatar" style={{ background: client.color, width: 56, height: 56, fontSize: '18px', borderRadius: 16 }}>{client.initials}</div>
                    <div>
                        <h1 className="page-title">{client.name}</h1>
                        <p className="text-sm text-muted">{client.industry} • {client.contactEmail}</p>
                    </div>
                    <span className={`badge ${client.status === 'active' ? 'badge-success badge-dot' : 'badge-gray'}`}>{client.status}</span>
                </div>
            </div>

            {/* Tabs */}
            <div className="tabs">
                {tabs.map(t => (
                    <button key={t.key} className={`tab ${activeTab === t.key ? 'active' : ''}`} onClick={() => setActiveTab(t.key)}>
                        <t.icon size={14} style={{ marginRight: 6 }} />{t.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
                <div>
                    <div className="grid-4 mb-6">
                        <div className="kpi-card" style={{ '--kpi-accent': client.color }}><div className="kpi-value">{stats.total}</div><div className="kpi-label">Total Leads</div></div>
                        <div className="kpi-card" style={{ '--kpi-accent': '#3b82f6' }}><div className="kpi-value">{stats.new}</div><div className="kpi-label">New Leads</div></div>
                        <div className="kpi-card" style={{ '--kpi-accent': '#10b981' }}><div className="kpi-value">{stats.won}</div><div className="kpi-label">Won</div></div>
                        <div className="kpi-card" style={{ '--kpi-accent': '#f59e0b' }}><div className="kpi-value">{stats.today}</div><div className="kpi-label">Today</div></div>
                    </div>

                    <div className="grid-2">
                        <div className="card">
                            <h3 className="card-title mb-4">Lead Sources</h3>
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center justify-between"><span className="badge badge-website"><Globe size={12} /> Website</span><span className="font-semibold">{stats.website}</span></div>
                                <div className="flex items-center justify-between"><span className="badge badge-meta"><Facebook size={12} /> Meta Ads</span><span className="font-semibold">{stats.meta}</span></div>
                                <div className="flex items-center justify-between"><span className="badge badge-google"><Chrome size={12} /> Google Ads</span><span className="font-semibold">{stats.google}</span></div>
                            </div>
                        </div>

                        <div className="card">
                            <h3 className="card-title mb-4">Websites</h3>
                            {websites.map(w => (
                                <div key={w.id} className="flex items-center gap-3 mb-3">
                                    <Globe size={16} className="text-muted" />
                                    <div><p className="font-medium text-sm">{w.name}</p><p className="text-xs text-muted">{w.domain}</p></div>
                                    <span className={`badge ml-auto ${w.isActive ? 'badge-success' : 'badge-gray'}`}>{w.isActive ? 'Active' : 'Inactive'}</span>
                                </div>
                            ))}
                            {websites.length === 0 && <p className="text-sm text-muted">No websites configured</p>}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'leads' && <LeadsPage />}
            {activeTab === 'pipeline' && <PipelinePage />}

            {activeTab === 'integrations' && (
                <div className="card">
                    <h3 className="card-title mb-4">Connected Sources</h3>
                    {sources.map(s => {
                        const integration = useStore.getState().getSourceIntegration(s.id);
                        return (
                            <div key={s.id} className="flex items-center gap-4 p-3 mb-2" style={{ background: 'var(--gray-50)', borderRadius: 'var(--radius-lg)' }}>
                                <div className={`health-dot ${integration?.status === 'connected' ? 'healthy' : integration?.status === 'warning' ? 'warning' : 'inactive'}`} />
                                <div className="flex-1">
                                    <p className="font-medium text-sm">{s.label}</p>
                                    <p className="text-xs text-muted">{s.type === 'google_ads' ? 'Google Ads' : s.type === 'meta' ? 'Meta Ads' : 'Website'}</p>
                                </div>
                                {integration && <span className="text-xs text-muted">Last sync: {new Date(integration.lastSync).toLocaleDateString()}</span>}
                                <span className={`badge ${integration?.status === 'connected' ? 'badge-success' : 'badge-warning'}`}>{integration?.status || 'Not connected'}</span>
                            </div>
                        );
                    })}
                </div>
            )}

            {activeTab === 'fields' && (
                <div className="card">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="card-title">Lead Fields Configuration</h3>
                            <p className="text-sm text-muted">Define unique data points you want to capture for this client.</p>
                        </div>
                        <button className="btn btn-secondary btn-sm" onClick={handleAddField}>+ Add Field</button>
                    </div>

                    <div className="flex flex-col gap-4">
                        {customFields.map((field, index) => (
                            <div key={index} className="flex gap-3 items-end p-4" style={{ background: 'var(--gray-50)', borderRadius: 'var(--radius-lg)' }}>
                                <div className="form-group mb-0 flex-1">
                                    <label className="form-label text-xs">Field Label</label>
                                    <input className="form-input form-input-sm" value={field.label} onChange={e => handleFieldChange(index, 'label', e.target.value)} placeholder="e.g. Project Type" />
                                </div>
                                <div className="form-group mb-0 flex-1">
                                    <label className="form-label text-xs">Database Key (API-friendly)</label>
                                    <input className="form-input form-input-sm" value={field.key} onChange={e => {
                                        const val = e.target.value.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
                                        handleFieldChange(index, 'key', val);
                                    }} placeholder="e.g. project_type" />
                                </div>
                                <div className="form-group mb-0" style={{ width: 120 }}>
                                    <label className="form-label text-xs">Type</label>
                                    <select className="form-select form-input-sm" value={field.type} onChange={e => handleFieldChange(index, 'type', e.target.value)}>
                                        <option value="text">Text</option>
                                        <option value="number">Number</option>
                                        <option value="date">Date</option>
                                        <option value="boolean">Checkbox</option>
                                    </select>
                                </div>
                                <button className="btn btn-ghost btn-sm text-danger" onClick={() => handleRemoveField(index)}>Remove</button>
                            </div>
                        ))}

                        {customFields.length === 0 && (
                            <div className="p-8 text-center border-dashed border-2 rounded-xl text-muted">
                                No custom fields defined yet.
                            </div>
                        )}

                        <div className="mt-4 flex justify-end">
                            <button className="btn btn-primary" onClick={handleSaveFields} disabled={saving}>
                                {saving ? 'Saving...' : 'Save Field Configuration'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'team' && (
                <div className="card">
                    <h3 className="card-title mb-4">Assigned Team Members</h3>
                    {(typeof client.assignedUsers === 'string' ? JSON.parse(client.assignedUsers || '[]') : (client.assignedUsers || [])).map(uid => {
                        const u = useStore.getState().getUser(uid);
                        return u ? (
                            <div key={uid} className="flex items-center gap-3 mb-3">
                                <div className="avatar" style={{ background: u.color }}>{u.initials}</div>
                                <div><p className="font-medium text-sm">{u.name}</p><p className="text-xs text-muted">{u.role}</p></div>
                            </div>
                        ) : null;
                    })}
                </div>
            )}

            {activeTab === 'activity' && (
                <div className="card">
                    <h3 className="card-title mb-4">Client Activity History</h3>
                    <div className="timeline">
                        {[
                            { id: 1, type: 'status', text: 'Status updated to Contacted for lead "John Doe"', time: '2 hours ago' },
                            { id: 2, type: 'note', text: 'New note added to lead "Jane Smith"', time: '5 hours ago' },
                            { id: 3, type: 'integration', text: 'Integration "Main Website" synced 5 new leads', time: '1 day ago' },
                            { id: 4, type: 'client', text: 'Client information updated by Admin', time: '2 days ago' },
                        ].map(act => (
                            <div key={act.id} className="timeline-item">
                                <div className="timeline-dot" />
                                <div className="timeline-content">{act.text}</div>
                                <div className="timeline-time">{act.time}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'settings' && (
                <div className="card">
                    <h3 className="card-title mb-4">Client Settings</h3>
                    <div className="form-group">
                        <label className="form-label">Client Name</label>
                        <input className="form-input" value={settingsForm.name} onChange={e => handleSettingsChange('name', e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Industry</label>
                        <input className="form-input" value={settingsForm.industry} onChange={e => handleSettingsChange('industry', e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Contact Email</label>
                        <input className="form-input" value={settingsForm.contactEmail} onChange={e => handleSettingsChange('contactEmail', e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Notes</label>
                        <textarea className="form-textarea" value={settingsForm.notes} onChange={e => handleSettingsChange('notes', e.target.value)} />
                    </div>
                    <button className="btn btn-primary mt-4" onClick={handleSaveSettings} disabled={saving}>
                        {saving ? 'Saving...' : 'Save Details'}
                    </button>
                </div>
            )}
        </div>
    );
}
