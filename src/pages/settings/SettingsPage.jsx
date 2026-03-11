import React, { useState } from 'react';
import { Building2, Palette, Bell, Database, Save } from 'lucide-react';
import useStore from '../../data/store';

export default function SettingsPage() {
    const { agency, statuses } = useStore();
    const [activeTab, setActiveTab] = useState('agency');

    const tabs = [
        { key: 'agency', label: 'Agency', icon: Building2 },
        { key: 'statuses', label: 'Lead Statuses', icon: Database },
        { key: 'notifications', label: 'Notifications', icon: Bell },
    ];

    return (
        <div className="page-content">
            <div className="page-header"><div><h1 className="page-title">Settings</h1><p className="page-subtitle">Configure your CRM preferences</p></div></div>

            <div className="flex gap-6">
                <div className="settings-sidebar">
                    {tabs.map(t => (
                        <button key={t.key} className={`settings-nav-item ${activeTab === t.key ? 'active' : ''}`} onClick={() => setActiveTab(t.key)}>
                            <t.icon size={16} />{t.label}
                        </button>
                    ))}
                </div>

                <div className="flex-1">
                    {activeTab === 'agency' && (
                        <div className="card">
                            <h3 className="card-title mb-4">Agency Information</h3>
                            <div className="form-group"><label className="form-label">Agency Name</label><input className="form-input" defaultValue={agency.name} /></div>
                            <div className="grid-2">
                                <div className="form-group"><label className="form-label">Domain</label><input className="form-input" defaultValue={agency.domain} /></div>
                                <div className="form-group"><label className="form-label">Plan</label><input className="form-input" defaultValue={agency.plan} disabled /></div>
                            </div>
                            <button className="btn btn-primary mt-4"><Save size={14} /> Save Changes</button>
                        </div>
                    )}

                    {activeTab === 'statuses' && (
                        <div className="card">
                            <h3 className="card-title mb-4">Lead Statuses</h3>
                            <p className="text-sm text-muted mb-4">Customize the lead pipeline stages</p>
                            <div className="flex flex-col gap-2">
                                {statuses.map(s => (
                                    <div key={s.id} className="flex items-center gap-3 p-3" style={{ background: 'var(--gray-50)', borderRadius: 'var(--radius-lg)' }}>
                                        <span className="status-dot" style={{ background: s.color, width: 12, height: 12 }} />
                                        <input className="form-input form-input-sm" defaultValue={s.label} style={{ flex: 1 }} />
                                        <input type="color" defaultValue={s.color} style={{ width: 32, height: 32, border: 'none', cursor: 'pointer' }} />
                                        <span className="text-xs text-muted">#{s.position}</span>
                                    </div>
                                ))}
                            </div>
                            <button className="btn btn-primary mt-4"><Save size={14} /> Save Statuses</button>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="card">
                            <h3 className="card-title mb-4">Notification Preferences</h3>
                            <div className="flex flex-col gap-3">
                                {[{ label: 'New lead received', desc: 'Get notified when a new lead comes in' },
                                { label: 'Follow-up reminder', desc: 'Reminder before a follow-up is due' },
                                { label: 'Integration sync alerts', desc: 'Get alerted on sync issues' },
                                { label: 'Weekly report', desc: 'Receive a weekly performance summary' }
                                ].map((n, i) => (
                                    <label key={i} className="flex items-center justify-between p-3" style={{ background: 'var(--gray-50)', borderRadius: 'var(--radius-lg)' }}>
                                        <div><p className="font-medium text-sm">{n.label}</p><p className="text-xs text-muted">{n.desc}</p></div>
                                        <input type="checkbox" className="checkbox" defaultChecked />
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
