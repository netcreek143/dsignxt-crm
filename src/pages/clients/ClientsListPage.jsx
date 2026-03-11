import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MoreVertical, Globe, Facebook, Chrome, Users, Mail, Phone, Search } from 'lucide-react';
import useStore from '../../data/store';
import './Clients.css';

export default function ClientsListPage() {
    const { clients, getClientStats, sources, websites } = useStore();
    const [showAdd, setShowAdd] = useState(false);
    const [search, setSearch] = useState('');
    const navigate = useNavigate();

    const filtered = clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.brand.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="page-content">
            <div className="page-header">
                <div><h1 className="page-title">Clients</h1><p className="page-subtitle">Manage your agency's client portfolio</p></div>
                <div className="flex gap-3 items-center">
                    <div className="search-input-wrapper">
                        <Search size={16} />
                        <input className="search-input" placeholder="Search clients..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: 220 }} />
                    </div>
                    <button className="btn btn-primary" onClick={() => setShowAdd(true)}><Plus size={16} /> Add Client</button>
                </div>
            </div>

            <div className="clients-grid">
                {filtered.map(client => {
                    const st = getClientStats(client.id);
                    const clientWebsites = websites.filter(w => w.clientId === client.id);
                    const clientSources = sources.filter(s => s.clientId === client.id);
                    return (
                        <div key={client.id} className="client-card" onClick={() => navigate(`/clients/${client.id}`)}>
                            <div className="client-card-top">
                                <div className="client-card-avatar" style={{ background: client.color }}>{client.initials}</div>
                                <div className="client-card-info">
                                    <h3 className="client-card-name">{client.name}</h3>
                                    <span className="text-sm text-muted">{client.industry}</span>
                                </div>
                                <span className={`badge ${client.status === 'active' ? 'badge-success badge-dot' : 'badge-gray badge-dot'}`}>{client.status}</span>
                            </div>

                            <div className="client-card-stats">
                                <div className="client-stat">
                                    <span className="client-stat-value">{st.total}</span>
                                    <span className="client-stat-label">Total Leads</span>
                                </div>
                                <div className="client-stat">
                                    <span className="client-stat-value">{st.new}</span>
                                    <span className="client-stat-label">New</span>
                                </div>
                                <div className="client-stat">
                                    <span className="client-stat-value">{st.won}</span>
                                    <span className="client-stat-label">Won</span>
                                </div>
                            </div>

                            <div className="client-card-sources">
                                {st.website > 0 && <span className="badge badge-website"><Globe size={10} /> {st.website} website</span>}
                                {st.meta > 0 && <span className="badge badge-meta"><Facebook size={10} /> {st.meta} meta</span>}
                                {st.google > 0 && <span className="badge badge-google"><Chrome size={10} /> {st.google} google</span>}
                            </div>

                            <div className="client-card-footer">
                                <div className="flex items-center gap-2 text-sm text-muted">
                                    <Globe size={12} /> {clientWebsites.length} website{clientWebsites.length !== 1 ? 's' : ''}
                                    <span className="dot-separator" />
                                    {clientSources.length} source{clientSources.length !== 1 ? 's' : ''}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Add Client Modal */}
            {showAdd && <AddClientModal onClose={() => setShowAdd(false)} />}
        </div>
    );
}

function AddClientModal({ onClose }) {
    const addClient = useStore(s => s.addClient);
    const [form, setForm] = useState({ name: '', brand: '', industry: '', contactEmail: '', contactPhone: '', notes: '' });
    const colors = ['#059669', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#8b5cf6', '#ec4899', '#3b82f6'];

    const handleSubmit = (e) => {
        e.preventDefault();
        const initials = form.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
        addClient({
            name: form.name,
            brand: form.brand || form.name.split(' ')[0],
            industry: form.industry,
            contactPhone: form.contactPhone,
            contactEmail: form.contactEmail,
            notes: form.notes,
            status: 'active',
            color: colors[Math.floor(Math.random() * colors.length)],
            initials: initials,
            assignedUsers: [],
            logo: null
        });
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header"><h3 className="modal-title">Add New Client</h3><button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}>✕</button></div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="form-group"><label className="form-label">Client Name *</label><input className="form-input" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g., Acme Corp" /></div>
                        <div className="form-group"><label className="form-label">Brand Name</label><input className="form-input" value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} placeholder="e.g., Acme" /></div>
                        <div className="grid-2">
                            <div className="form-group"><label className="form-label">Industry</label><select className="form-select" value={form.industry} onChange={e => setForm({ ...form, industry: e.target.value })}><option value="">Select...</option><option>Technology</option><option>E-commerce</option><option>Real Estate</option><option>Healthcare</option><option>Education</option><option>Fitness</option><option>Interior Design</option><option>Other</option></select></div>
                            <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={form.contactPhone} onChange={e => setForm({ ...form, contactPhone: e.target.value })} placeholder="+91..." /></div>
                        </div>
                        <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" value={form.contactEmail} onChange={e => setForm({ ...form, contactEmail: e.target.value })} /></div>
                        <div className="form-group"><label className="form-label">Notes</label><textarea className="form-textarea" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3} /></div>
                    </div>
                    <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button><button type="submit" className="btn btn-primary">Add Client</button></div>
                </form>
            </div>
        </div>
    );
}
