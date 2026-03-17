import React, { useState } from 'react';
import { Plug, Globe, Facebook, Chrome, FileSpreadsheet, Plus, CheckCircle, AlertTriangle, XCircle, RefreshCw, Copy, ExternalLink, ArrowRight } from 'lucide-react';
import useStore from '../../data/store';
import './Integrations.css';

const platformIcon = { website: Globe, meta: Facebook, google_ads: Chrome, google_sheets: FileSpreadsheet };
const platformLabel = { website: 'Website Form', meta: 'Meta Lead Ads', google_ads: 'Google Ads', google_sheets: 'Google Sheets' };
const platformColor = { website: '#3b82f6', meta: '#8b5cf6', google_ads: '#f59e0b', google_sheets: '#10b981' };

export default function IntegrationsPage() {
    const { integrations, sources, clients, syncLogs, getClient, getSource, ingestTestLead } = useStore();
    const [activeTab, setActiveTab] = useState('connections');
    const [showWebsiteWizard, setShowWebsiteWizard] = useState(false);
    const [showMetaWizard, setShowMetaWizard] = useState(false);
    const [showGoogleWizard, setShowGoogleWizard] = useState(false);
    const [showSheetsWizard, setShowSheetsWizard] = useState(false);

    return (
        <div className="page-content">
            <div className="page-header">
                <div><h1 className="page-title">Integrations</h1><p className="page-subtitle">Manage your lead source connections</p></div>
                <div className="flex gap-2">
                    <button className="btn btn-secondary" onClick={() => setShowWebsiteWizard(true)}><Globe size={16} /> Website</button>
                    <button className="btn btn-secondary" onClick={() => setShowMetaWizard(true)}><Facebook size={16} /> Meta Ads</button>
                    <button className="btn btn-secondary" onClick={() => setShowGoogleWizard(true)}><Chrome size={16} /> Google Ads</button>
                    <button className="btn btn-primary" onClick={() => setShowSheetsWizard(true)}><FileSpreadsheet size={16} /> Google Sheets</button>
                </div>
            </div>

            <div className="tabs">
                {['connections', 'sync-logs'].map(t => (
                    <button key={t} className={`tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
                        {t === 'connections' ? 'Connections' : 'Sync Logs'}
                    </button>
                ))}
            </div>

            {activeTab === 'connections' && (
                <div className="integration-grid">
                    {integrations.map(integ => {
                        const source = getSource(integ.sourceId);
                        const client = source ? getClient(source.clientId) : null;
                        const Icon = platformIcon[integ.platform] || Plug;
                        return (
                            <div key={integ.id} className="integration-card">
                                <div className="integration-card-header">
                                    <div className="integration-icon" style={{ background: `${platformColor[integ.platform]}15`, color: platformColor[integ.platform] }}><Icon size={20} /></div>
                                    <div className="flex-1">
                                        <h4 className="font-medium" style={{ fontSize: 'var(--font-md)' }}>{source?.label}</h4>
                                        <p className="text-xs text-muted">{client?.name} • {platformLabel[integ.platform]}</p>
                                    </div>
                                    <button className="btn btn-ghost btn-sm" onClick={() => {
                                        ingestTestLead(integ.sourceId, integ.id);
                                        alert('Simulated lead ingested successfully! Check the Leads tab.');
                                    }}>
                                        <RefreshCw size={14} /> Test
                                    </button>
                                    <div className={`health-dot ${integ.status === 'connected' ? 'healthy' : integ.status === 'warning' ? 'warning' : 'error'}`} />
                                </div>
                                <div className="integration-card-stats">
                                    <div><span className="text-xs text-muted">Leads Synced</span><span className="font-semibold">{integ.leadsTotal}</span></div>
                                    <div><span className="text-xs text-muted">Last Sync</span><span className="text-sm">{new Date(integ.lastSync).toLocaleDateString()}</span></div>
                                    <div><span className="text-xs text-muted">Status</span><span className={`badge ${integ.status === 'connected' ? 'badge-success' : 'badge-warning'}`}>{integ.status}</span></div>
                                </div>
                                {integ.webhookUrl && (
                                    <div className="integration-webhook">
                                        <span className="text-xs text-muted">Webhook URL</span>
                                        <div className="webhook-url">
                                            <code className="text-xs">{integ.webhookUrl}</code>
                                            <button className="btn btn-ghost btn-icon btn-sm" onClick={() => navigator.clipboard.writeText(integ.webhookUrl)}><Copy size={12} /></button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {activeTab === 'sync-logs' && (
                <div className="data-table-wrapper">
                    <table className="data-table">
                        <thead><tr><th>Integration</th><th>Status</th><th>Leads Synced</th><th>Error</th><th>Time</th></tr></thead>
                        <tbody>
                            {syncLogs.map(log => {
                                const integ = integrations.find(i => i.id === log.integrationId);
                                const source = integ ? getSource(integ.sourceId) : null;
                                return (
                                    <tr key={log.id}>
                                        <td className="font-medium">{source?.label || 'Unknown'}</td>
                                        <td><span className={`badge ${log.status === 'success' ? 'badge-success' : 'badge-warning'}`}>{log.status}</span></td>
                                        <td>{log.leadsSynced}</td>
                                        <td className="text-sm text-muted">{log.error || '—'}</td>
                                        <td className="text-sm text-muted">{new Date(log.startedAt).toLocaleString()}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Website Setup Wizard */}
            {showWebsiteWizard && <SetupWizard type="website" onClose={() => setShowWebsiteWizard(false)} />}
            {showMetaWizard && <SetupWizard type="meta" onClose={() => setShowMetaWizard(false)} />}
            {showGoogleWizard && <SetupWizard type="google_ads" onClose={() => setShowGoogleWizard(false)} />}
            {showSheetsWizard && <SetupWizard type="google_sheets" onClose={() => setShowSheetsWizard(false)} />}
        </div>
    );
}

function SetupWizard({ type, onClose }) {
    const { clients, addSource, addIntegration } = useStore();
    const [step, setStep] = useState(0);
    const [selectedClient, setSelectedClient] = useState('');
    const [config, setConfig] = useState({ name: '', page: '', campaign: '' });
    const [createdIntegration, setCreatedIntegration] = useState(null);

    const titles = { website: 'Website Integration', meta: 'Meta Ads Integration', google_ads: 'Google Ads Integration', google_sheets: 'Google Sheets Integration' };
    const steps = { 
        website: ['Select Client', 'Add Website', 'Get Code', 'Test'], 
        meta: ['Select Client', 'Connect Account', 'Select Page', 'Map Fields'], 
        google_ads: ['Select Client', 'Connect Account', 'Select Campaign', 'Map Fields'],
        google_sheets: ['Select Client', 'Name Connection', 'Get Apps Script', 'Test']
    };
    const stepList = steps[type];
    const Icon = platformIcon[type];

    const sampleKey = `wk_${Date.now().toString(36)}`;
    const baseUrl = window.location.origin.replace(':5173', ':3001');
    const sampleWebhook = `${baseUrl}/api/webhooks/${sampleKey}`;
    const embedCode = `<script src="${baseUrl}/api/ingest.js" data-key="${sampleKey}"></script>`;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" style={{ maxWidth: 640 }} onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="flex items-center gap-3">
                        <div className="integration-icon" style={{ background: `${platformColor[type]}15`, color: platformColor[type], width: 36, height: 36, borderRadius: 10 }}><Icon size={18} /></div>
                        <h3 className="modal-title">{titles[type]}</h3>
                    </div>
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}>✕</button>
                </div>

                <div className="modal-body">
                    {/* Wizard Steps */}
                    <div className="wizard-steps">
                        {stepList.map((s, i) => (
                            <div key={i} className={`wizard-step ${i === step ? 'active' : i < step ? 'completed' : ''}`}>
                                <span className="wizard-step-number">{i < step ? '✓' : i + 1}</span>
                                <span className="wizard-step-label">{s}</span>
                            </div>
                        ))}
                    </div>

                    {step === 0 && (
                        <div>
                            <label className="form-label">Select Client</label>
                            <select className="form-select" value={selectedClient} onChange={e => setSelectedClient(e.target.value)}>
                                <option value="">Choose a client...</option>
                                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    )}

                    {step === 1 && type === 'website' && (
                        <div>
                            <div className="form-group"><label className="form-label">Website Domain</label><input className="form-input" placeholder="e.g., example.com" /></div>
                            <div className="form-group"><label className="form-label">Source Name</label><input className="form-input" value={config.name} onChange={e => setConfig({ ...config, name: e.target.value })} placeholder="e.g., Main Contact Form" /></div>
                        </div>
                    )}

                    {step === 1 && type === 'google_sheets' && (
                        <div>
                            <div className="form-group"><label className="form-label">Sheet Name / Document Name</label><input className="form-input" placeholder="e.g., Q1 Leads Document" /></div>
                            <div className="form-group"><label className="form-label">Source Name</label><input className="form-input" value={config.name} onChange={e => setConfig({ ...config, name: e.target.value })} placeholder="e.g., Incoming Google Sheets" /></div>
                        </div>
                    )}

                    {step === 1 && type === 'meta' && (
                        <div className="text-center p-8">
                            <div className="integration-icon" style={{ background: '#ede9fe', color: '#8b5cf6', margin: '0 auto 16px', width: 56, height: 56, borderRadius: 16 }}><Facebook size={28} /></div>
                            <h3 className="font-semibold mb-2">Connect Meta Business Account</h3>
                            <p className="text-sm text-muted mb-4">Click below to authorize access to your Meta Lead Ads</p>
                            <button className="btn btn-primary" onClick={() => setStep(2)}><Facebook size={16} /> Connect with Meta</button>
                        </div>
                    )}

                    {step === 1 && type === 'google_ads' && (
                        <div className="text-center p-8">
                            <div className="integration-icon" style={{ background: '#fef3c7', color: '#b45309', margin: '0 auto 16px', width: 56, height: 56, borderRadius: 16 }}><Chrome size={28} /></div>
                            <h3 className="font-semibold mb-2">Connect Google Ads Account</h3>
                            <p className="text-sm text-muted mb-4">Click below to authorize access to your Google Ads lead forms</p>
                            <button className="btn btn-primary" onClick={() => setStep(2)}><Chrome size={16} /> Connect with Google</button>
                        </div>
                    )}

                    {step === 2 && type === 'website' && (
                        <div>
                            <h4 className="font-semibold mb-3">Choose Integration Method</h4>
                            <div className="integration-methods">
                                <div className="method-card">
                                    <h5 className="font-medium mb-1">📋 Webhook URL</h5>
                                    <p className="text-xs text-muted mb-2">Point your form to this URL</p>
                                    <div className="code-block" style={{ fontSize: 11 }}>{createdIntegration?.webhookUrl || 'Generating...'}</div>
                                    <button className="btn btn-sm btn-secondary mt-2" onClick={() => createdIntegration && navigator.clipboard.writeText(createdIntegration.webhookUrl)}><Copy size={12} /> Copy</button>
                                </div>
                                <div className="method-card">
                                    <h5 className="font-medium mb-1">🔗 Embed Script</h5>
                                    <p className="text-xs text-muted mb-2">Paste in your website's head tag</p>
                                    <div className="code-block" style={{ fontSize: 11 }}>{createdIntegration ? `<script src="${baseUrl}/api/ingest.js" data-key="${createdIntegration.webhookKey}"></script>` : 'Generating...'}</div>
                                    <button className="btn btn-sm btn-secondary mt-2" onClick={() => createdIntegration && navigator.clipboard.writeText(`<script src="${baseUrl}/api/ingest.js" data-key="${createdIntegration.webhookKey}"></script>`)}><Copy size={12} /> Copy</button>
                                </div>
                            </div>
                            <p className="text-xs text-muted mt-3">API Key: <code>{createdIntegration?.webhookKey || '...'}</code></p>
                        </div>
                    )}

                    {step === 2 && type === 'google_sheets' && (
                        <div>
                            <h4 className="font-semibold mb-3">Add Google Apps Script</h4>
                            <p className="text-sm text-muted mb-4">Go to your Google Sheet, click <b>Extensions &gt; Apps Script</b>. Paste this code and save. This will automatically sync new rows to the CRM.</p>
                            
                            <div className="code-block" style={{ fontSize: 11, whiteSpace: 'pre-wrap', maxHeight: 200, overflowY: 'auto' }}>
{`function onEdit(e) {
  var sheet = e.source.getActiveSheet();
  var row = e.range.getRow();
  
  // Create payload from cell A, B, C...
  var payload = {
    name: sheet.getRange(row, 1).getValue(),
    email: sheet.getRange(row, 2).getValue(),
    phone: sheet.getRange(row, 3).getValue(),
    utm_source: sheet.getRange(row, 4).getValue() || "",
    utm_medium: sheet.getRange(row, 5).getValue() || "",
    utm_campaign: sheet.getRange(row, 6).getValue() || ""
  };
  
  UrlFetchApp.fetch("${createdIntegration?.webhookUrl || 'GENERATING_URL'}", {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload)
  });
}`}
                            </div>
                            <button className="btn btn-sm btn-secondary mt-3" onClick={() => {
                                const code = `function onEdit(e) {\n  var sheet = e.source.getActiveSheet();\n  var row = e.range.getRow();\n  var payload = {\n    name: sheet.getRange(row, 1).getValue(),\n    email: sheet.getRange(row, 2).getValue(),\n    phone: sheet.getRange(row, 3).getValue(),\n    utm_source: sheet.getRange(row, 4).getValue() || "",\n    utm_medium: sheet.getRange(row, 5).getValue() || "",\n    utm_campaign: sheet.getRange(row, 6).getValue() || ""\n  };\n  UrlFetchApp.fetch("${createdIntegration?.webhookUrl}", {\n    method: "post",\n    contentType: "application/json",\n    payload: JSON.stringify(payload)\n  });\n}`;
                                navigator.clipboard.writeText(code);
                            }}><Copy size={12} /> Copy Code</button>
                        </div>
                    )}

                    {step === 2 && (type === 'meta' || type === 'google_ads') && (
                        <div>
                            <label className="form-label">{type === 'meta' ? 'Select Facebook Page' : 'Select Campaign'}</label>
                            <select className="form-select mb-4" value={config.campaign} onChange={e => setConfig({ ...config, campaign: e.target.value })}>
                                <option value="">Select an option...</option>
                                <option value={type === 'meta' ? 'Sample Facebook Page' : 'Sample Campaign 2024'}>{type === 'meta' ? 'Sample Facebook Page' : 'Sample Campaign 2024'}</option>
                            </select>
                            <label className="form-label">Select Source Form</label>
                            <select className="form-select mb-6">
                                <option>Lead Capture Form #1</option>
                            </select>

                            <h4 className="font-semibold mb-3">Field Mapping</h4>
                            <p className="text-xs text-muted mb-4">Map fields from your source form to DSignXT CRM fields.</p>
                            <div className="flex flex-col gap-2">
                                {[
                                    { from: 'Full Name', to: 'fullName' },
                                    { from: 'Email Address', to: 'email' },
                                    { from: 'Phone Number', to: 'phone' },
                                    { from: 'Company Name', to: 'company' },
                                    { from: 'City', to: 'city' }
                                ].map((m, i) => (
                                    <div key={i} className="flex gap-2 items-center">
                                        <div className="form-input form-input-sm" style={{ flex: 1, background: 'var(--gray-50)' }}>{m.from}</div>
                                        <ArrowRight size={14} className="text-muted" />
                                        <select className="form-select form-input-sm" defaultValue={m.to} style={{ flex: 1 }}>
                                            <option value="fullName">Name</option>
                                            <option value="email">Email</option>
                                            <option value="phone">Phone</option>
                                            <option value="company">Company</option>
                                            <option value="city">City</option>
                                        </select>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {step === 3 && (
                        <div className="text-center p-8">
                            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#d1fae5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}><CheckCircle size={28} /></div>
                            <h3 className="font-semibold mb-2">Integration Ready!</h3>
                            <p className="text-sm text-muted">Your {titles[type].toLowerCase()} is set up and ready to receive leads.</p>
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    {step > 0 && <button className="btn btn-secondary" onClick={() => setStep(step - 1)}>Back</button>}
                    <div className="flex-1" />
                    {step < 3 ? (
                        <button className="btn btn-primary" onClick={async () => {
                            if (step === 1) {
                                // Save integration on step 1 completion (moving to "Get Code")
                                const integrationResult = await addIntegration({
                                    clientId: selectedClient,
                                    type: type,
                                    platform: type,
                                    label: config.name || config.campaign || `${titles[type]} Source`,
                                    status: 'connected'
                                });
                                setCreatedIntegration(integrationResult);
                            }
                            setStep(step + 1);
                        }} disabled={(step === 0 && !selectedClient) || (step === 1 && (type === 'website' || type === 'google_sheets') && !config.name) || (step === 2 && type !== 'website' && type !== 'google_sheets' && !config.campaign)}>
                            Next <ArrowRight size={14} />
                        </button>
                    ) : (
                        <button className="btn btn-success" onClick={onClose}><CheckCircle size={14} /> Done</button>
                    )}
                </div>
            </div>
        </div>
    );
}
