import React, { useState, useMemo } from 'react';
import { Search, Filter, Download, ChevronDown, ChevronUp, Globe, Facebook, Chrome, Eye, MoreHorizontal } from 'lucide-react';
import useStore from '../../data/store';
import LeadDetailDrawer from './LeadDetailDrawer';
import './Leads.css';

const SOURCE_BADGE = { website: 'badge-website', meta: 'badge-meta', google_ads: 'badge-google', manual: 'badge-manual', api: 'badge-api' };
const SOURCE_ICON = { website: Globe, meta: Facebook, google_ads: Chrome };
const SOURCE_LABEL = { website: 'Website', meta: 'Meta Ads', google_ads: 'Google Ads', manual: 'Manual', api: 'API' };
const TEMP_BADGE = { hot: 'badge-hot', warm: 'badge-warm', cold: 'badge-cold' };

export default function LeadsPage() {
    const { clients, statuses, users, selectedClientId, tableConfigs } = useStore();
    const getFilteredLeads = useStore(s => s.getFilteredLeads);
    const getClientData = useStore(s => s.getClient);
    const getUser = useStore(s => s.getUser);

    const [filters, setFilters] = useState({});
    const [search, setSearch] = useState('');
    const [sortKey, setSortKey] = useState('createdAt');
    const [sortDir, setSortDir] = useState('desc');
    const [selectedLeadId, setSelectedLeadId] = useState(null);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [showFilters, setShowFilters] = useState(false);

    const leads = useMemo(() => {
        let result = getFilteredLeads({ ...filters, search, clientId: selectedClientId });
        result.sort((a, b) => {
            const aVal = a[sortKey], bVal = b[sortKey];
            if (sortDir === 'asc') return aVal > bVal ? 1 : -1;
            return aVal < bVal ? 1 : -1;
        });
        return result;
    }, [filters, search, sortKey, sortDir, selectedClientId, getFilteredLeads]);

    const currentTableConfig = selectedClientId ? tableConfigs[selectedClientId] : null;
    const client = selectedClientId ? getClientData(selectedClientId) : null;
    const clientCustomFields = client?.customFields ? JSON.parse(typeof client.customFields === 'string' ? client.customFields : JSON.stringify(client.customFields)) : [];

    const defaultColumns = ['fullName', 'sourceType', 'clientName', 'statusId', 'temperature', 'assignedTo', 'createdAt'];
    let columnsToDisplay = currentTableConfig ? currentTableConfig.columns : defaultColumns;

    // Add custom field keys to display if client selected
    if (selectedClientId && clientCustomFields.length > 0) {
        // Append up to 3 custom fields to the table for readability
        const fieldKeys = clientCustomFields.slice(0, 3).map(f => f.key);
        columnsToDisplay = [...columnsToDisplay.slice(0, 5), ...fieldKeys, ...columnsToDisplay.slice(5)];
    }

    const columnLabels = {
        fullName: 'Name',
        sourceType: 'Source',
        clientName: 'Client',
        statusId: 'Status',
        temperature: 'Temp',
        assignedTo: 'Assigned To',
        createdAt: 'Date',
        campaign: 'Campaign',
        city: 'City',
        phone: 'Phone',
        email: 'Email',
        priority: 'Priority',
        ...Object.fromEntries(clientCustomFields.map(f => [f.key, f.label]))
    };

    const toggleSort = (key) => {
        if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortKey(key); setSortDir('asc'); }
    };

    const toggleSelect = (id) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const toggleAll = () => {
        setSelectedIds(prev => prev.size === leads.length ? new Set() : new Set(leads.map(l => l.id)));
    };

    const SortIcon = ({ k }) => sortKey === k ? (sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : null;

    const getStatus = (id) => statuses.find(s => s.id === id);

    const renderCell = (lead, col) => {
        // Handle custom fields
        if (clientCustomFields.some(f => f.key === col)) {
            const customData = lead.customData ? JSON.parse(lead.customData) : {};
            return <span className="text-sm truncate max-w-[150px] inline-block">{customData[col] || '—'}</span>;
        }

        switch (col) {
            case 'fullName':
                return (
                    <div className="lead-name-cell">
                        <span className="font-medium">{lead.fullName}</span>
                        <span className="text-xs text-muted">{lead.email}</span>
                    </div>
                );
            case 'sourceType':
                const Sicon = SOURCE_ICON[lead.sourceType];
                return <span className={`badge ${SOURCE_BADGE[lead.sourceType]}`}>{Sicon && <Sicon size={10} />} {SOURCE_LABEL[lead.sourceType]}</span>;
            case 'clientName':
                return <span className="text-sm">{getClientData(lead.clientId)?.name}</span>;
            case 'statusId':
                const status = getStatus(lead.statusId);
                return <span className={`status-chip status-${status?.label.toLowerCase().replace(/\s+/g, '-')}`}>{status?.label}</span>;
            case 'temperature':
                return <span className={`badge ${TEMP_BADGE[lead.temperature]}`}>{lead.temperature === 'hot' ? '🔥' : lead.temperature === 'warm' ? '🌤' : '❄️'} {lead.temperature}</span>;
            case 'assignedTo':
                const user = getUser(lead.assignedTo);
                return user ? (
                    <div className="flex items-center gap-2">
                        <div className="avatar avatar-xs" style={{ background: user.color }}>{user.initials}</div>
                        <span className="text-sm">{user.name.split(' ')[0]}</span>
                    </div>
                ) : '—';
            case 'createdAt':
                return <span className="text-sm text-muted">{new Date(lead.createdAt).toLocaleDateString()}</span>;
            case 'campaign':
                return <span className="text-sm">{lead.campaign || '—'}</span>;
            case 'city':
                return <span className="text-sm">{lead.city || '—'}</span>;
            case 'priority':
                return <span className={`badge ${lead.priority === 'high' ? 'badge-danger' : lead.priority === 'medium' ? 'badge-warning' : 'badge-gray'}`}>{lead.priority}</span>;
            default:
                return <span className="text-sm">{lead[col] || '—'}</span>;
        }
    };

    return (
        <div className="page-content">
            <div className="page-header">
                <div><h1 className="page-title">Leads</h1><p className="page-subtitle">{leads.length} leads {selectedClientId ? `for ${getClientData(selectedClientId)?.name}` : 'across all clients'}</p></div>
                <div className="flex gap-3">
                    <button className="btn btn-secondary" onClick={() => setShowFilters(!showFilters)}><Filter size={16} /> Filters</button>
                    <button className="btn btn-secondary" onClick={() => alert('Exporting leads to CSV...')}><Download size={16} /> Export</button>
                </div>
            </div>

            {/* Filter Bar */}
            {showFilters && (
                <div className="leads-filters animate-slide-up">
                    <select className="form-select form-input-sm" value={filters.sourceType || ''} onChange={e => setFilters({ ...filters, sourceType: e.target.value || undefined })} style={{ width: 140 }}>
                        <option value="">All Sources</option>
                        <option value="website">Website</option>
                        <option value="meta">Meta Ads</option>
                        <option value="google_ads">Google Ads</option>
                        <option value="manual">Manual</option>
                    </select>
                    <select className="form-select form-input-sm" value={filters.statusId || ''} onChange={e => setFilters({ ...filters, statusId: e.target.value || undefined })} style={{ width: 150 }}>
                        <option value="">All Statuses</option>
                        {statuses.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                    </select>
                    <select className="form-select form-input-sm" value={filters.temperature || ''} onChange={e => setFilters({ ...filters, temperature: e.target.value || undefined })} style={{ width: 120 }}>
                        <option value="">Temperature</option>
                        <option value="hot">🔥 Hot</option>
                        <option value="warm">🌤 Warm</option>
                        <option value="cold">❄️ Cold</option>
                    </select>
                    <select className="form-select form-input-sm" value={filters.assignedTo || ''} onChange={e => setFilters({ ...filters, assignedTo: e.target.value || undefined })} style={{ width: 150 }}>
                        <option value="">All Assignees</option>
                        {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                    {!selectedClientId && (
                        <select className="form-select form-input-sm" value={filters.clientId || ''} onChange={e => setFilters({ ...filters, clientId: e.target.value || undefined })} style={{ width: 150 }}>
                            <option value="">All Clients</option>
                            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    )}
                    <button className="btn btn-ghost btn-sm" onClick={() => setFilters({})}>Clear All</button>
                </div>
            )
            }

            {/* Search */}
            <div className="leads-search-bar">
                <div className="search-input-wrapper" style={{ flex: 1, maxWidth: 400 }}>
                    <Search size={16} />
                    <input className="search-input" placeholder="Search by name, email, phone, company..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                {selectedIds.size > 0 && (
                    <div className="bulk-actions flex gap-2 items-center">
                        <span className="text-sm font-medium">{selectedIds.size} selected</span>
                        <button className="btn btn-sm btn-secondary">Assign</button>
                        <button className="btn btn-sm btn-secondary">Update Status</button>
                        <button className="btn btn-sm btn-ghost" onClick={() => setSelectedIds(new Set())}>Deselect</button>
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="data-table-wrapper">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th className="checkbox-cell"><input type="checkbox" className="checkbox" checked={selectedIds.size === leads.length && leads.length > 0} onChange={toggleAll} /></th>
                            {columnsToDisplay.map(col => (
                                <th key={col} onClick={() => toggleSort(col)}>
                                    {columnLabels[col] || col} <SortIcon k={col} />
                                </th>
                            ))}
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {leads.map(lead => (
                            <tr key={lead.id} className={selectedIds.has(lead.id) ? 'selected' : ''} onClick={() => setSelectedLeadId(lead.id)}>
                                <td className="checkbox-cell" onClick={e => e.stopPropagation()}><input type="checkbox" className="checkbox" checked={selectedIds.has(lead.id)} onChange={() => toggleSelect(lead.id)} /></td>
                                {columnsToDisplay.map(col => (
                                    <td key={col}>{renderCell(lead, col)}</td>
                                ))}
                                <td><button className="btn btn-ghost btn-icon btn-sm" onClick={e => { e.stopPropagation(); setSelectedLeadId(lead.id); }}><Eye size={14} /></button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {leads.length === 0 && (
                    <div className="empty-state"><div className="empty-state-icon"><Search size={28} /></div><h3 className="empty-state-title">No leads found</h3><p className="empty-state-desc">Try adjusting your filters or search query</p></div>
                )}
            </div>

            {selectedLeadId && <LeadDetailDrawer leadId={selectedLeadId} onClose={() => setSelectedLeadId(null)} />}
        </div >
    );
}
