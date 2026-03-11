import React, { useState } from 'react';
import { X, Mail, Phone, Building2, MapPin, Globe, Facebook, Chrome, Calendar, User, MessageSquare, Clock, Send, Tag, Flame, Thermometer } from 'lucide-react';
import useStore from '../../data/store';

const SOURCE_LABEL = { website: 'Website', meta: 'Meta Ads', google_ads: 'Google Ads', manual: 'Manual', api: 'API' };
const SOURCE_BADGE = { website: 'badge-website', meta: 'badge-meta', google_ads: 'badge-google', manual: 'badge-gray' };

export default function LeadDetailDrawer({ leadId, onClose }) {
    const { leads, statuses, users, getLeadNotes, getLeadActivities, updateLeadStatus, updateLeadAssignee, addLeadNote } = useStore();
    const lead = leads.find(l => l.id === leadId);
    const notes = getLeadNotes(leadId);
    const activities = getLeadActivities(leadId);
    const [noteText, setNoteText] = useState('');
    const [activeTab, setActiveTab] = useState('details');

    if (!lead) return null;

    const status = statuses.find(s => s.id === lead.statusId);
    const assignee = users.find(u => u.id === lead.assignedTo);
    const client = useStore.getState().getClient(lead.clientId);

    const handleAddNote = () => {
        if (!noteText.trim()) return;
        addLeadNote(leadId, noteText);
        setNoteText('');
    };

    return (
        <>
            <div className="drawer-overlay" onClick={onClose} />
            <div className="drawer">
                <div className="drawer-header">
                    <div>
                        <h2 style={{ fontSize: 'var(--font-lg)', fontWeight: 600 }}>{lead.fullName}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={`badge ${SOURCE_BADGE[lead.sourceType]}`}>{SOURCE_LABEL[lead.sourceType]}</span>
                            <span className="text-sm text-muted">{client?.name}</span>
                        </div>
                    </div>
                    <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={20} /></button>
                </div>

                <div className="tabs" style={{ padding: '0 var(--space-6)' }}>
                    {['details', 'activity', 'notes'].map(tab => (
                        <button key={tab} className={`tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                <div className="drawer-body">
                    {activeTab === 'details' && (
                        <>
                            {/* Status & Assignment */}
                            <div className="detail-section">
                                <h4 className="detail-section-title">Lead Status</h4>
                                <div className="detail-grid">
                                    <div className="detail-field">
                                        <label>Status</label>
                                        <select className="form-select form-input-sm" value={lead.statusId} onChange={e => updateLeadStatus(leadId, e.target.value)}>
                                            {statuses.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                                        </select>
                                    </div>
                                    <div className="detail-field">
                                        <label>Assigned To</label>
                                        <select className="form-select form-input-sm" value={lead.assignedTo} onChange={e => updateLeadAssignee(leadId, e.target.value)}>
                                            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="detail-field">
                                        <label>Priority</label>
                                        <span className={`badge ${lead.priority === 'high' ? 'badge-danger' : lead.priority === 'medium' ? 'badge-warning' : 'badge-gray'}`}>{lead.priority}</span>
                                    </div>
                                    <div className="detail-field">
                                        <label>Temperature</label>
                                        <span className={`badge badge-${lead.temperature}`}>{lead.temperature === 'hot' ? '🔥' : lead.temperature === 'warm' ? '🌤' : '❄️'} {lead.temperature}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="divider" />

                            {/* Contact Info */}
                            <div className="detail-section">
                                <h4 className="detail-section-title">Contact Information</h4>
                                <div className="detail-list">
                                    <div className="detail-row"><Mail size={14} /> <span>{lead.email}</span></div>
                                    <div className="detail-row"><Phone size={14} /> <span>{lead.phone}</span></div>
                                    {lead.altPhone && <div className="detail-row"><Phone size={14} /> <span>{lead.altPhone}</span></div>}
                                    {lead.company && <div className="detail-row"><Building2 size={14} /> <span>{lead.company}</span></div>}
                                    <div className="detail-row"><MapPin size={14} /> <span>{lead.city}, {lead.country}</span></div>
                                </div>
                            </div>

                            <div className="divider" />

                            <div className="divider" />

                            {/* Source Details */}
                            <div className="detail-section">
                                <h4 className="detail-section-title">Source Details</h4>
                                <div className="detail-list">
                                    <div className="detail-row"><span className="detail-label">Source</span><span>{lead.sourceLabel}</span></div>
                                    <div className="detail-row"><span className="detail-label">Platform</span><span className={`badge ${SOURCE_BADGE[lead.sourceType]}`}>{SOURCE_LABEL[lead.sourceType]}</span></div>
                                    {lead.campaign && <div className="detail-row"><span className="detail-label">Campaign</span><span>{lead.campaign}</span></div>}
                                    {lead.adSet && <div className="detail-row"><span className="detail-label">Ad Set</span><span>{lead.adSet}</span></div>}
                                    {lead.adName && <div className="detail-row"><span className="detail-label">Ad</span><span>{lead.adName}</span></div>}
                                    {lead.formName && <div className="detail-row"><span className="detail-label">Form</span><span>{lead.formName}</span></div>}
                                    {lead.utmSource && <div className="detail-row"><span className="detail-label">UTM Source</span><span>{lead.utmSource}</span></div>}
                                    {lead.utmMedium && <div className="detail-row"><span className="detail-label">UTM Medium</span><span>{lead.utmMedium}</span></div>}
                                </div>
                            </div>

                            <div className="divider" />

                            {/* Custom Fields */}
                            {client?.customFields && JSON.parse(client.customFields).length > 0 && (
                                <div className="detail-section">
                                    <h4 className="detail-section-title">Custom Fields</h4>
                                    <div className="detail-list">
                                        {JSON.parse(client.customFields).map(field => {
                                            const customData = lead.customData ? JSON.parse(lead.customData) : {};
                                            const value = customData[field.key] || customData[field.label] || '—';
                                            return (
                                                <div key={field.key} className="detail-row">
                                                    <span className="detail-label">{field.label}</span>
                                                    <span>{value}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="divider" style={{ marginTop: 'var(--space-4)' }} />
                                </div>
                            )}

                            {/* Dates */}
                            <div className="detail-section">
                                <h4 className="detail-section-title">Timeline</h4>
                                <div className="detail-list">
                                    <div className="detail-row"><Calendar size={14} /> <span className="detail-label">Created</span><span>{new Date(lead.createdAt).toLocaleString()}</span></div>
                                    <div className="detail-row"><Clock size={14} /> <span className="detail-label">Updated</span><span>{new Date(lead.updatedAt).toLocaleString()}</span></div>
                                    {lead.lastContactedAt && <div className="detail-row"><Phone size={14} /> <span className="detail-label">Last Contacted</span><span>{new Date(lead.lastContactedAt).toLocaleString()}</span></div>}
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'activity' && (
                        <div className="timeline">
                            {activities.length === 0 && <p className="text-sm text-muted">No activity recorded yet.</p>}
                            {activities.map(a => {
                                const u = users.find(u => u.id === a.userId);
                                return (
                                    <div key={a.id} className="timeline-item">
                                        <div className="timeline-dot" />
                                        <div className="timeline-content"><strong>{u?.name}</strong> {a.description}</div>
                                        <div className="timeline-time">{new Date(a.createdAt).toLocaleString()}</div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {activeTab === 'notes' && (
                        <div>
                            <div className="note-input-wrap">
                                <textarea className="form-textarea" placeholder="Add a note..." value={noteText} onChange={e => setNoteText(e.target.value)} rows={3} />
                                <button className="btn btn-primary btn-sm" onClick={handleAddNote} disabled={!noteText.trim()}><Send size={14} /> Add Note</button>
                            </div>
                            <div className="divider" />
                            {notes.length === 0 && <p className="text-sm text-muted">No notes yet.</p>}
                            {notes.map(n => {
                                const u = users.find(u => u.id === n.userId);
                                return (
                                    <div key={n.id} className="note-item">
                                        <div className="note-header">
                                            <div className="avatar avatar-xs" style={{ background: u?.color }}>{u?.initials}</div>
                                            <span className="font-medium text-sm">{u?.name}</span>
                                            <span className="text-xs text-muted ml-auto">{new Date(n.createdAt).toLocaleString()}</span>
                                        </div>
                                        <p className="note-body">{n.content}</p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
