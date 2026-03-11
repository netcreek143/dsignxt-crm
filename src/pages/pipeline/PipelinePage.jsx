import React, { useState } from 'react';
import { Globe, Facebook, Chrome, User } from 'lucide-react';
import useStore from '../../data/store';
import LeadDetailDrawer from '../leads/LeadDetailDrawer';

const SOURCE_BADGE = { website: 'badge-website', meta: 'badge-meta', google_ads: 'badge-google', manual: 'badge-gray' };
const TEMP_BADGE = { hot: 'badge-hot', warm: 'badge-warm', cold: 'badge-cold' };

export default function PipelinePage() {
    const { statuses, selectedClientId, getLeadsByStatus, getUser, getClient } = useStore();
    const groups = getLeadsByStatus(selectedClientId);
    const [selectedLeadId, setSelectedLeadId] = useState(null);
    const updateLeadStatus = useStore(s => s.updateLeadStatus);

    const handleDragStart = (e, leadId) => { e.dataTransfer.setData('leadId', leadId); };
    const handleDrop = (e, statusId) => {
        e.preventDefault();
        const leadId = e.dataTransfer.getData('leadId');
        if (leadId) updateLeadStatus(leadId, statusId);
    };
    const handleDragOver = (e) => e.preventDefault();

    return (
        <div className="page-content">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Pipeline</h1>
                    <p className="page-subtitle">Drag leads between stages to update status</p>
                </div>
            </div>

            <div className="kanban-board">
                {statuses.map(status => {
                    const cards = groups[status.id] || [];
                    return (
                        <div key={status.id} className="kanban-column" onDragOver={handleDragOver} onDrop={e => handleDrop(e, status.id)}>
                            <div className="kanban-column-header">
                                <div className="flex items-center gap-2">
                                    <span className="status-dot" style={{ background: status.color }} />
                                    <span className="kanban-column-title">{status.label}</span>
                                </div>
                                <span className="kanban-count">{cards.length}</span>
                            </div>
                            <div className="kanban-cards">
                                {cards.map(lead => {
                                    const user = getUser(lead.assignedTo);
                                    const client = getClient(lead.clientId);
                                    return (
                                        <div key={lead.id} className="kanban-card" draggable onDragStart={e => handleDragStart(e, lead.id)} onClick={() => setSelectedLeadId(lead.id)}>
                                            <div className="kanban-card-title">{lead.fullName}</div>
                                            <div className="text-xs text-muted mb-2">{client?.name}</div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className={`badge ${SOURCE_BADGE[lead.sourceType]}`} style={{ fontSize: '10px' }}>{lead.sourceType === 'google_ads' ? 'Google' : lead.sourceType === 'meta' ? 'Meta' : 'Web'}</span>
                                                <span className={`badge ${TEMP_BADGE[lead.temperature]}`} style={{ fontSize: '10px' }}>{lead.temperature}</span>
                                            </div>
                                            <div className="kanban-card-meta">
                                                <span className="text-xs text-muted">{new Date(lead.createdAt).toLocaleDateString()}</span>
                                                {user && <div className="avatar avatar-xs" style={{ background: user.color }} title={user.name}>{user.initials}</div>}
                                            </div>
                                        </div>
                                    );
                                })}
                                {cards.length === 0 && <div className="text-xs text-muted" style={{ padding: 12, textAlign: 'center' }}>No leads</div>}
                            </div>
                        </div>
                    );
                })}
            </div>

            {selectedLeadId && <LeadDetailDrawer leadId={selectedLeadId} onClose={() => setSelectedLeadId(null)} />}
        </div>
    );
}
