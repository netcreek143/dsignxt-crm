import React, { useState } from 'react';
import { X, Mail, Phone, Building2, MapPin, Globe, Facebook, Chrome, Calendar, User, MessageSquare, Clock, Send, Tag, Flame, Thermometer, Sparkles } from 'lucide-react';
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
                    {['details', 'ai', 'activity', 'notes'].map(tab => (
                        <button key={tab} className={`tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                            {tab === 'ai' ? <span className="flex items-center gap-1"><Sparkles size={14} /> AI Insights</span> : tab.charAt(0).toUpperCase() + tab.slice(1)}
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
                                    {lead.utm_source && <div className="detail-row"><span className="detail-label">UTM Source</span><span>{lead.utm_source}</span></div>}
                                    {lead.utm_medium && <div className="detail-row"><span className="detail-label">UTM Medium</span><span>{lead.utm_medium}</span></div>}
                                    {lead.utm_campaign && <div className="detail-row"><span className="detail-label">UTM Campaign</span><span>{lead.utm_campaign}</span></div>}
                                    {lead.utm_term && <div className="detail-row"><span className="detail-label">UTM Term</span><span>{lead.utm_term}</span></div>}
                                    {lead.utm_content && <div className="detail-row"><span className="detail-label">UTM Content</span><span>{lead.utm_content}</span></div>}
                                </div>
                            </div>

                            <div className="divider" />

                            {/* Dynamic Source Data */}
                            {(() => {
                                const customData = lead.customData ? JSON.parse(lead.customData) : {};
                                const coreKeys = ['name', 'fullName', 'email', 'phone', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'sourceType', 'sourceLabel'];
                                const dynamicKeys = Object.keys(customData).filter(key => !coreKeys.includes(key));

                                if (dynamicKeys.length === 0) return null;

                                return (
                                    <div className="detail-section">
                                        <h4 className="detail-section-title">Dynamic Source Data</h4>
                                        <div className="detail-list">
                                            {dynamicKeys.map(key => (
                                                <div key={key} className="detail-row">
                                                    <span className="detail-label" style={{ textTransform: 'capitalize' }}>
                                                        {key.replace(/_/g, ' ')}
                                                    </span>
                                                    <span>{String(customData[key]) || '—'}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })()}

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
                    {activeTab === 'ai' && (
                        <div className="ai-analysis-container">
                            {!lead.aiAnalysis ? (
                                <div className="empty-state py-12">
                                    <div className="bg-indigo-50 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <Sparkles size={24} className="text-indigo-600" />
                                    </div>
                                    <h4 className="font-semibold text-gray-900">No AI Analysis Yet</h4>
                                    <p className="text-sm text-gray-500 mt-1 mb-4">Click analyze on the lead list to generate insights.</p>
                                </div>
                            ) : (
                                <div className="ai-report animate-fade-in">
                                    <div className="flex items-center gap-2 mb-4 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100/50">
                                        <div className="bg-indigo-600 text-white p-1.5 rounded-lg shadow-sm">
                                            <Sparkles size={16} />
                                        </div>
                                        <span className="text-sm font-semibold text-indigo-900">AI Intelligence Report</span>
                                    </div>
                                    <div className="prose prose-sm prose-indigo whitespace-pre-wrap text-sm leading-relaxed text-gray-700 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                                        {lead.aiAnalysis}
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-4 text-center italic">Analysis generated by Gemini 2.0 AI based on current lead context.</p>
                                </div>
                            )}
                        </div>
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
