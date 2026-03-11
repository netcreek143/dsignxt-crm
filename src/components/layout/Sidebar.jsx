import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, UserPlus, Inbox, GitBranch, Plug, BarChart3, Settings, ChevronLeft, ChevronRight, Zap, Building2, ChevronDown, Check, Bell, Key } from 'lucide-react';
import useStore from '../../data/store';
import './Sidebar.css';

const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/clients', icon: Building2, label: 'Clients' },
    { path: '/client-access', icon: Key, label: 'Client Logins' },
    { path: '/leads', icon: Inbox, label: 'Leads' },
    { path: '/pipeline', icon: GitBranch, label: 'Pipeline' },
    { path: '/integrations', icon: Plug, label: 'Integrations' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/team', icon: UserPlus, label: 'Team' },
    { path: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
    const { currentUser, clients, selectedClientId, setSelectedClient, sidebarCollapsed, toggleSidebar, notifications } = useStore();
    const [clientDropdownOpen, setClientDropdownOpen] = useState(false);
    const location = useLocation();
    const unread = notifications.filter(n => !n.isRead).length;
    const selectedClient = clients.find(c => c.id === selectedClientId);
    
    const isSuperAdmin = currentUser?.role === 'super_admin';
    const isClient = currentUser?.role === 'client';
    
    // Check if user has permission. Superadmins always have access.
    const hasPerm = (p) => isSuperAdmin || (currentUser?.permissions && JSON.parse(currentUser.permissions).includes(p));
    
    const visibleNavItems = navItems.filter(item => {
        if (item.label === 'Client Logins') return isSuperAdmin;
        return hasPerm(item.label.toLowerCase());
    });

    return (
        <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-brand">
                <div className="sidebar-logo">
                    <Zap size={22} />
                </div>
                    {!sidebarCollapsed && <span className="sidebar-brand-text">DSignXT<span className="brand-accent">CRM</span></span>}
            </div>

            {!sidebarCollapsed && !isClient && (
                <div className="client-switcher" onClick={() => setClientDropdownOpen(!clientDropdownOpen)}>
                    <div className="client-switcher-current">
                        {selectedClient ? (
                            <div className="client-avatar-mini" style={{ background: selectedClient.color }}>{selectedClient.initials}</div>
                        ) : (
                            <div className="client-avatar-mini all"><Building2 size={14} /></div>
                        )}
                        <span className="client-switcher-name">{selectedClient ? selectedClient.name : 'All Clients'}</span>
                        <ChevronDown size={14} className={`chevron ${clientDropdownOpen ? 'open' : ''}`} />
                    </div>
                    {clientDropdownOpen && (
                        <div className="client-dropdown" onClick={e => e.stopPropagation()}>
                            <button className={`client-option ${!selectedClientId ? 'active' : ''}`} onClick={() => { setSelectedClient(null); setClientDropdownOpen(false); }}>
                                <div className="client-avatar-mini all"><Building2 size={14} /></div>
                                <span>All Clients</span>
                                {!selectedClientId && <Check size={14} className="check" />}
                            </button>
                            <div className="client-dropdown-divider" />
                            {clients.map(c => (
                                <button key={c.id} className={`client-option ${selectedClientId === c.id ? 'active' : ''}`} onClick={() => { setSelectedClient(c.id); setClientDropdownOpen(false); }}>
                                    <div className="client-avatar-mini" style={{ background: c.color }}>{c.initials}</div>
                                    <span>{c.name}</span>
                                    {selectedClientId === c.id && <Check size={14} className="check" />}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
            
            {!sidebarCollapsed && isClient && selectedClient && (
                <div className="client-switcher" style={{ cursor: 'default' }}>
                    <div className="client-switcher-current text-left">
                        <div className="client-avatar-mini" style={{ background: selectedClient.color }}>{selectedClient.initials}</div>
                        <span className="client-switcher-name">{selectedClient.name}</span>
                    </div>
                </div>
            )}

            <nav className="sidebar-nav">
                {visibleNavItems.map(item => (
                    <NavLink key={item.path} to={item.path} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end={item.path === '/'}>
                        <item.icon size={20} />
                        {!sidebarCollapsed && <span>{item.label}</span>}
                        {item.label === 'Leads' && unread > 0 && !sidebarCollapsed && <span className="nav-badge">{unread}</span>}
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer">
                <button className="sidebar-collapse-btn" onClick={toggleSidebar}>
                    {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                    {!sidebarCollapsed && <span>Collapse</span>}
                </button>
            </div>
        </aside>
    );
}
