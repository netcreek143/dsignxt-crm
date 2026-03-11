import React, { useState } from 'react';
import { UserPlus, Shield, Mail, MoreVertical } from 'lucide-react';
import useStore from '../../data/store';

const ROLE_LABELS = { super_admin: 'Super Admin', admin: 'Admin', manager: 'Manager', executive: 'Executive', client_viewer: 'Client Viewer' };
const ROLE_BADGES = { super_admin: 'badge-primary', admin: 'badge-info', manager: 'badge-warning', executive: 'badge-gray', client_viewer: 'badge-success' };

const AVAILABLE_MODULES = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'clients', label: 'Clients' },
    { id: 'leads', label: 'Leads' },
    { id: 'pipeline', label: 'Pipeline' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'integrations', label: 'Integrations' },
    { id: 'team', label: 'Team' },
    { id: 'settings', label: 'Settings' }
];

export default function TeamPage() {
    const { users, clients, createUserInDb, currentUser, updateUserInDb } = useStore();
    const [showInvite, setShowInvite] = useState(false);
    const [inviting, setInviting] = useState(false);
    const [inviteForm, setInviteForm] = useState({
        name: '',
        email: '',
        role: 'executive',
        assignedClientIds: [],
        permissions: AVAILABLE_MODULES.map(m => m.id)
    });
    const [editingUser, setEditingUser] = useState(null);

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

    const toggleClientAssignment = (clientId) => {
        setInviteForm(prev => {
            const current = prev.assignedClientIds;
            const next = current.includes(clientId)
                ? current.filter(id => id !== clientId)
                : [...current, clientId];
            return { ...prev, assignedClientIds: next };
        });
    };

    const handleSendInvite = async () => {
        if (!inviteForm.name || !inviteForm.email) return alert('Name and email are required');
        setInviting(true);
        try {
            if (editingUser) {
                await updateUserInDb(editingUser.id, {
                    name: inviteForm.name,
                    email: inviteForm.email,
                    role: inviteForm.role,
                    permissions: inviteForm.permissions
                });
                alert('User updated successfully!');
            } else {
                await createUserInDb(inviteForm);
                alert('User invited successfully!');
            }
            setShowInvite(false);
            setEditingUser(null);
            setInviteForm({ name: '', email: '', role: 'executive', assignedClientIds: [], permissions: AVAILABLE_MODULES.map(m => m.id) });
        } catch (error) {
            alert('Error inviting user');
        } finally {
            setInviting(false);
        }
    };

    const openEditModal = (user) => {
        setEditingUser(user);
        setInviteForm({
            name: user.name,
            email: user.email,
            role: user.role,
            assignedClientIds: [], // We only support editing permissions/roles simply here for now
            permissions: user.permissions ? JSON.parse(user.permissions) : AVAILABLE_MODULES.map(m => m.id)
        });
        setShowInvite(true);
    };

    return (
        <div className="page-content">
            <div className="page-header">
                <div><h1 className="page-title">Team</h1><p className="page-subtitle">Manage users and permissions</p></div>
                {currentUser?.role === 'super_admin' && (
                    <button className="btn btn-primary" onClick={() => {
                        setEditingUser(null);
                        setInviteForm({ name: '', email: '', role: 'executive', assignedClientIds: [], permissions: AVAILABLE_MODULES.map(m => m.id) });
                        setShowInvite(true);
                    }}><UserPlus size={16} /> Invite User</button>
                )}
            </div>

            <div className="data-table-wrapper">
                <table className="data-table">
                    <thead><tr><th>User</th><th>Email</th><th>Role</th><th>Assigned Clients</th><th>Status</th><th></th></tr></thead>
                    <tbody>
                        {users.filter(u => u.role !== 'client').map(u => {
                            const assignedClients = clients.filter(c => {
                                try {
                                    const assigned = typeof c.assignedUsers === 'string' ? JSON.parse(c.assignedUsers) : c.assignedUsers;
                                    return Array.isArray(assigned) && assigned.includes(u.id);
                                } catch (e) { return false; }
                            });
                            return (
                                <tr key={u.id}>
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <div className="avatar" style={{ background: u.color }}>{u.initials}</div>
                                            <span className="font-medium">{u.name}</span>
                                        </div>
                                    </td>
                                    <td className="text-sm text-muted">{u.email}</td>
                                    <td><span className={`badge ${ROLE_BADGES[u.role]}`}><Shield size={10} /> {ROLE_LABELS[u.role]}</span></td>
                                    <td>
                                        <div className="flex gap-1 flex-wrap">
                                            {assignedClients.slice(0, 3).map(c => <span key={c.id} className="badge badge-gray">{c.name}</span>)}
                                            {assignedClients.length > 3 && <span className="badge badge-gray">+{assignedClients.length - 3}</span>}
                                            {assignedClients.length === 0 && <span className="text-sm text-muted">No clients assigned</span>}
                                        </div>
                                    </td>
                                    <td><span className={`badge ${u.status === 'active' ? 'badge-success badge-dot' : 'badge-gray badge-dot'}`}>{u.status}</span></td>
                                    <td>
                                        {currentUser?.role === 'super_admin' && (
                                            <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEditModal(u)}><MoreVertical size={14} /></button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {showInvite && (
                <div className="modal-overlay" onClick={() => { setShowInvite(false); setEditingUser(null); }}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header"><h3 className="modal-title">{editingUser ? 'Edit Internal User' : 'Invite Team Member'}</h3><button className="btn btn-ghost btn-icon btn-sm" onClick={() => { setShowInvite(false); setEditingUser(null); }}>✕</button></div>
                        <div className="modal-body">
                            <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" placeholder="John Doe" value={inviteForm.name} onChange={e => handleInviteChange('name', e.target.value)} /></div>
                            <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" placeholder="john@agency.com" value={inviteForm.email} onChange={e => handleInviteChange('email', e.target.value)} /></div>
                            <div className="form-group"><label className="form-label">Role</label>
                                <select className="form-select" value={inviteForm.role} onChange={e => handleInviteChange('role', e.target.value)}>
                                    <option value="executive">Executive</option><option value="manager">Manager</option><option value="admin">Admin</option>
                                </select>
                            </div>
                            {inviteForm.role !== 'client' && currentUser?.role === 'super_admin' && (
                                <div className="form-group"><label className="form-label">Granular Permissions</label>
                                    <div className="flex flex-col gap-2 mt-1">
                                        {AVAILABLE_MODULES.map(m => (
                                            <label key={m.id} className="checkbox-wrapper">
                                                <input type="checkbox" className="checkbox" checked={inviteForm.permissions.includes(m.id)} onChange={() => togglePermission(m.id)} />
                                                <span className="text-sm">{m.label} Module</span>
                                            </label>
                                        ))}
                                    </div>
                                    <p className="text-xs text-muted mt-2">Unchecking a module instantly hides it from this user.</p>
                                </div>
                            )}

                            {!editingUser && (
                                <div className="form-group"><label className="form-label">Assign to Clients</label>
                                    <div className="flex flex-col gap-2 mt-1">
                                        {clients.map(c => (
                                            <label key={c.id} className="checkbox-wrapper">
                                                <input type="checkbox" className="checkbox" checked={inviteForm.assignedClientIds.includes(c.id)} onChange={() => toggleClientAssignment(c.id)} />
                                                <span className="text-sm">{c.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => { setShowInvite(false); setEditingUser(null); }}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleSendInvite} disabled={inviting}>
                                {editingUser ? 'Save Updates' : <><Mail size={14} /> {inviting ? 'Inviting...' : 'Send Invite'}</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
