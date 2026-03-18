import React, { useState, useEffect } from 'react';
import { Building2, Palette, Bell, Database, Save, Sparkles, Shield, Bot, CheckCircle, AlertCircle, Zap, Cpu, MessageSquare } from 'lucide-react';
import useStore from '../../data/store';

export default function SettingsPage() {
    const { agency, statuses } = useStore();
    const [activeTab, setActiveTab] = useState('agency');
    const [aiStatus, setAiStatus] = useState({ gemini: false, groq: false, mistral: false });

    useEffect(() => {
        if (activeTab === 'ai') {
            fetch('/api/ai/status')
                .then(res => res.json())
                .then(data => setAiStatus(data))
                .catch(e => console.error('Failed to fetch AI status', e));
        }
    }, [activeTab]);

    const tabs = [
        { key: 'agency', label: 'Agency', icon: Building2 },
        { key: 'statuses', label: 'Lead Statuses', icon: Database },
        { key: 'notifications', label: 'Notifications', icon: Bell },
        { key: 'ai', label: 'AI Configuration', icon: Sparkles },
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

                    {activeTab === 'ai' && (
                        <div className="flex flex-col gap-6">
                            <div className="card border-indigo-100 bg-indigo-50/10">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="bg-indigo-600 text-white p-2 rounded-xl shadow-lg shadow-indigo-200">
                                        <Bot size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">AI Intelligence Core</h3>
                                        <p className="text-xs text-indigo-600 font-medium uppercase tracking-wider">Powered by Gemini 2.0 Flash</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-indigo-200 transition-colors cursor-pointer">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600">
                                                <Sparkles size={18} />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm text-gray-900">Lead Analysis</p>
                                                <p className="text-xs text-gray-500">Enable LLM-powered lead summaries and sentiment analysis.</p>
                                            </div>
                                        </div>
                                        <div className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" defaultChecked />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                        </div>
                                    </label>

                                    <label className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-indigo-200 transition-colors cursor-pointer">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-purple-50 p-2 rounded-lg text-purple-600">
                                                <MessageSquare size={18} />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm text-gray-900">AI Chatbot</p>
                                                <p className="text-xs text-gray-500">Allow users to chat with an AI regarding their lead data.</p>
                                            </div>
                                        </div>
                                        <div className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" defaultChecked />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <div className="card">
                                <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Cpu size={16} className="text-indigo-600" />
                                    Available AI Engines
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {[
                                        { id: 'groq', label: 'Groq (Llama 3)', desc: 'Ultra-fast inference', active: aiStatus.groq, icon: Zap },
                                        { id: 'gemini', label: 'Google Gemini', desc: 'Standard multimodel AI', active: aiStatus.gemini, icon: Bot },
                                        { id: 'mistral', label: 'Mistral AI', desc: 'Open-weights efficiency', active: aiStatus.mistral, icon: Sparkles }
                                    ].map(p => (
                                        <div key={p.id} className={`p-4 rounded-2xl border ${p.active ? 'bg-emerald-50/10 border-emerald-100' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
                                            <div className="flex items-center justify-between mb-2">
                                                <div className={`p-2 rounded-lg ${p.active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-400'}`}>
                                                    <p.icon size={16} />
                                                </div>
                                                {p.active ? <CheckCircle size={14} className="text-emerald-500" /> : <AlertCircle size={14} className="text-gray-400" />}
                                            </div>
                                            <p className="font-bold text-xs text-gray-900">{p.label}</p>
                                            <p className="text-[10px] text-gray-500 mt-1">{p.desc}</p>
                                            <p className={`text-[10px] font-bold uppercase mt-3 ${p.active ? 'text-emerald-600' : 'text-gray-400'}`}>
                                                {p.active ? 'Connected' : 'Missing Key'}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="card">
                                <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Shield size={16} className="text-gray-400" />
                                    Security & Data Privacy
                                </h4>
                                <div className="space-y-4">
                                    <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl">
                                        <p className="text-xs text-gray-600 leading-relaxed">
                                            AI processing follows <strong>Client Isolation Protocols</strong>. No data is stored on external AI servers beyond the transient session context. Groq is currently set as the primary engine for maximum speed.
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between pt-2">
                                        <span className="text-xs text-gray-500 italic">Global API Status: <span className={aiStatus.gemini || aiStatus.groq || aiStatus.mistral ? "text-emerald-600 font-bold" : "text-red-500 font-bold"}>
                                            {aiStatus.gemini || aiStatus.groq || aiStatus.mistral ? "Online" : "All Disconnected"}
                                        </span></span>
                                        <button className="btn btn-primary btn-sm" onClick={() => alert('AI Settings Saved')}>Save Configuration</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
