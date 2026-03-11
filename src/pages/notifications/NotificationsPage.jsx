import React, { useState } from 'react';
import { Bell, CheckCircle, Clock, AlertCircle, Calendar } from 'lucide-react';
import useStore from '../../data/store';

export default function NotificationsPage() {
    const { notifications } = useStore();
    const [filter, setFilter] = useState('all');

    const filtered = filter === 'all' ? notifications : notifications.filter(n => n.type === filter);

    return (
        <div className="page-content">
            <div className="page-header">
                <div><h1 className="page-title">Notifications & Reminders</h1><p className="page-subtitle">Stay updated on lead assignments and follow-ups</p></div>
            </div>

            <div className="tabs mb-6">
                <button className={`tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</button>
                <button className={`tab ${filter === 'assignment' ? 'active' : ''}`} onClick={() => setFilter('assignment')}>Assignments</button>
                <button className={`tab ${filter === 'follow_up' ? 'active' : ''}`} onClick={() => setFilter('follow_up')}>Reminders</button>
                <button className={`tab ${filter === 'system' ? 'active' : ''}`} onClick={() => setFilter('system')}>System</button>
            </div>

            <div className="card">
                {filtered.map(n => (
                    <div key={n.id} className="flex items-start gap-4 p-4 mb-3" style={{ background: n.read ? 'transparent' : 'var(--primary-50)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-100)' }}>
                        <div className={`avatar avatar-sm ${n.read ? 'badge-gray' : 'badge-primary'}`} style={{ borderRadius: '50%' }}>
                            {n.type === 'assignment' ? <CheckCircle size={14} /> : n.type === 'follow_up' ? <Calendar size={14} /> : <Bell size={14} />}
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <p className={`text-sm ${n.read ? 'text-gray-700' : 'font-semibold text-gray-900'}`}>{n.content}</p>
                                <span className="text-xs text-muted flex items-center gap-1"><Clock size={10} /> {new Date(n.createdAt).toLocaleDateString()}</span>
                            </div>
                            {!n.read && <button className="btn btn-ghost btn-sm text-primary mt-2" style={{ padding: 0 }}>Mark as read</button>}
                        </div>
                    </div>
                ))}
                {filtered.length === 0 && <div className="text-center py-12"><Bell size={32} className="text-muted mx-auto mb-3" /><p className="text-gray-500">No notifications in this category</p></div>}
            </div>
        </div>
    );
}
