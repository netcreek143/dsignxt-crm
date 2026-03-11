import React, { useState } from 'react';
import { UserPlus, Shield, Mail, MoreVertical, Key } from 'lucide-react';
import useStore from '../../data/store';

const AVAILABLE_MODULES = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'leads', label: 'Leads' },
    { id: 'pipeline', label: 'Pipeline' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'settings', label: 'Settings' }
];

export default function ClientAccessPage() {
    const { users, clients, createUserInDb, currentUser, updateUserInDb } = useStore();
    const [showInvite, setShowInvite] = useState(false);
    const [inviting, setInviting] = useState(false);
    
    // Default to a blank form
    const [inviteForm, setInviteForm] = useState({
        name: '',
        email: '',
        password: '',
        clientId: '',
        permissions: ['analytics']
    });
    
    const [editingUser, setEditingUser] = useState(null);
    const clientUsers = users.filter(u => u.role === 'client');

    const handleInviteChange = (field, value) => {
        setInviteForm(prev => ({ ...prev, [field]: value }));
    };

    const togglePermission = (permId) => {
        setInviteForm(prev => {
            const current = prev.permissions;
            const next = current.includes(permId)
                ? current.filter(id => id !== permId)
                : [...current, permId];
            return { ...prev, permissions: next };
        });
    };

    const handleSendInvite = async () => {
        if (!inviteForm.email || !inviteForm.clientId) return alert('Email and Client Association are required');
        
        setInviting(true);
        try {
            if (editingUser) {
                const updates = {
                    name: inviteForm.name,
                    email: inviteForm.email,
                    clientId: inviteForm.clientId,
                    permissions: inviteForm.permissions
                };
                if (inviteForm.password) updates.password = inviteForm.password;
                
                await updateUserInDb(editingUser.id, updates);
                alert('Client user updated successfully!');
            } else {
                if (!inviteForm.password) return alert('Initial password is required');
                if (!inviteForm.name) {
                    const linkedClient = clients.find(c => c.id === inviteForm.clientId);
                    inviteForm.name = linkedClient ? `${linkedClient.name} Client` : 'Client User';
                }
                await createUserInDb({
                    ...inviteForm,
                    role: 'client'
                });
                alert('Client access created successfully!');
            }
            setShowInvite(false);
            setEditingUser(null);
            setInviteForm({ name: '', email: '', password: '', clientId: '', permissions: ['analytics'] });
        } catch (error) {
            alert('Error saving client user');
        } finally {
            setInviting(false);
        }
    };

    const openEditModal = (user) => {
        setEditingUser(user);
        setInviteForm({
            name: user.name,
            email: user.email,
            password: '',
            clientId: user.clientId || '',
            permissions: user.permissions ? JSON.parse(user.permissions) : ['analytics']
        });
        setShowInvite(true);
    };

    if (currentUser?.role !== 'super_admin') {
        return (
            <div className="page-content flex-center">
                <h2>Access Denied</h2>
                <p className="text-muted">Only Super Admins can manage client access.</p>
            </div>
        );
    }

    return (
        <div className="page-content">
            <div className="page-header">
                <div><h1 className="page-title">Client Access</h1><p className="page-subtitle">Manage client portal logins and their permissions</p></div>
                <button className="btn btn-primary" onClick={() => {
                    setEditingUser(null);
                    setInviteForm({ name: '', email: '', password: '', clientId: '', permissions: ['analytics'] });
                    setShowInvite(true);
                }}><Key size={16} /> Create Client Login</button>
            </div>

            <div className="data-table-wrapper">
                <table className="data-table">
                    <thead><tr><th>Client User</th><th>Email</th><th>Associated Client</th><th>Status</th><th></th></tr></thead>
                    <tbody>
                        {clientUsers.map(u => {
                            const linkedClient = clients.find(c => c.id === u.clientId);
                            return (
                                <tr key={u.id}>
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <div className="avatar" style={{ background: u.color || '#059669' }}>{u.initials}</div>
                                            <span className="font-medium">{u.name}</span>
                                        </div>
                                    </td>
                                    <td className="text-sm text-muted">{u.email}</td>
                                    <td>
                                        {linkedClient ? (
                                            <span className="badge badge-gray">{linkedClient.name}</span>
                                        ) : (
                                            <span className="text-sm text-muted">Unassigned</span>
                                        )}
                                    </td>
                                    <td><span className={`badge ${u.status === 'active' ? 'badge-success badge-dot' : 'badge-gray badge-dot'}`}>{u.status}</span></td>
                                    <td>
                                        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEditModal(u)}><MoreVertical size={14} /></button>
                                    </td>
                                </tr>
                            );
                        })}
                        {clientUsers.length === 0 && (
                            <tr>
                                <td colSpan="5" className="text-center py-8 text-muted">No client logins created yet.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showInvite && (
                <div className="modal-overlay" onClick={() => { setShowInvite(false); setEditingUser(null); }}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header"><h3 className="modal-title">{editingUser ? 'Edit Client Login' : 'Create Client Login'}</h3><button className="btn btn-ghost btn-icon btn-sm" onClick={() => { setShowInvite(false); setEditingUser(null); }}>✕</button></div>
                        <div className="modal-body">
                            
                            <div className="form-group"><label className="form-label">Link to CRM Client</label>
                                <select className="form-select" value={inviteForm.clientId} onChange={e => handleInviteChange('clientId', e.target.value)}>
                                    <option value="">-- Select Client --</option>
                                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>

                            <div className="grid-2">
                                <div className="form-group"><label className="form-label">Name (Optional)</label>
                                    <input className="form-input" placeholder="e.g. John Smith" value={inviteForm.name} onChange={e => handleInviteChange('name', e.target.value)} />
                                </div>
                                <div className="form-group"><label className="form-label">Email / Login</label>
                                    <input className="form-input" type="email" placeholder="client@company.com" value={inviteForm.email} onChange={e => handleInviteChange('email', e.target.value)} />
                                </div>
                            </div>
                            
                            <div className="form-group"><label className="form-label">{editingUser ? 'New Password (leave blank to keep current)' : 'Initial Password'}</label>
                                <input className="form-input" type="password" placeholder="••••••••" value={inviteForm.password} onChange={e => handleInviteChange('password', e.target.value)} />
                            </div>
                            
                            <div className="form-group mt-4"><label className="form-label">Client Display Permissions</label>
                                <div className="flex flex-col gap-2 mt-1">
                                    {AVAILABLE_MODULES.map(m => (
                                        <label key={m.id} className="checkbox-wrapper">
                                            <input type="checkbox" className="checkbox" checked={inviteForm.permissions.includes(m.id)} onChange={() => togglePermission(m.id)} />
                                            <span className="text-sm">{m.label} Module</span>
                                        </label>
                                    ))}
                                </div>
                                <p className="text-xs text-muted mt-2">Checked items will be visible in the client's sidebar.</p>
                            </div>

                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => { setShowInvite(false); setEditingUser(null); }}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleSendInvite} disabled={inviting}>
                                {editingUser ? 'Save Updates' : <><Key size={14} /> {inviting ? 'Creating...' : 'Create Login'}</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
