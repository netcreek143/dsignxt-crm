import React from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import useStore from '../../data/store';

const SOURCE_COLORS = { website: '#3b82f6', meta: '#8b5cf6', google_ads: '#f59e0b', manual: '#6b7280' };

export default function AnalyticsPage() {
    const { clients, sources, statuses, users, currentUser } = useStore();
    
    const isClient = currentUser?.role === 'client';
    // If client, force filter leads to only show their leads
    const allLeads = useStore(s => s.leads);
    const leads = isClient ? allLeads.filter(l => l.clientId === currentUser?.clientId) : allLeads;

    const byClient = clients.map(c => ({
        name: c.name, leads: leads.filter(l => l.clientId === c.id).length, color: c.color
    }));

    const bySource = [
        { name: 'Website', value: leads.filter(l => l.sourceType === 'website').length, color: SOURCE_COLORS.website },
        { name: 'Meta Ads', value: leads.filter(l => l.sourceType === 'meta').length, color: SOURCE_COLORS.meta },
        { name: 'Google Ads', value: leads.filter(l => l.sourceType === 'google_ads').length, color: SOURCE_COLORS.google_ads },
        { name: 'Manual', value: leads.filter(l => l.sourceType === 'manual').length, color: SOURCE_COLORS.manual },
    ].filter(s => s.value > 0);

    const byStatus = statuses.map(s => ({
        name: s.label, count: leads.filter(l => l.statusId === s.id).length, color: s.color
    })).filter(s => s.count > 0);

    const last30 = Array.from({ length: 30 }, (_, i) => {
        const date = new Date(Date.now() - (29 - i) * 86400000);
        return { day: date.toLocaleDateString('en', { day: 'numeric', month: 'short' }), leads: leads.filter(l => new Date(l.createdAt).toDateString() === date.toDateString()).length };
    });

    const byAssignee = users.map(u => ({
        name: u.name.split(' ')[0], leads: leads.filter(l => l.assignedTo === u.id).length, color: u.color
    }));

    const byCampaign = {};
    leads.forEach(l => { if (l.campaign) byCampaign[l.campaign] = (byCampaign[l.campaign] || 0) + 1; });
    const campaignData = Object.entries(byCampaign).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 8);

    return (
        <div className="page-content">
            <div className="page-header"><div><h1 className="page-title">Analytics</h1><p className="page-subtitle">Lead performance across clients and sources</p></div></div>

            <div className="grid-2 mb-6">
                <div className="card"><div className="card-header"><h3 className="card-title">Lead Trend (30 Days)</h3></div>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={last30}><CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" /><XAxis dataKey="day" fontSize={10} tickLine={false} interval={4} /><YAxis fontSize={12} tickLine={false} /><Tooltip /><Line type="monotone" dataKey="leads" stroke="#6366f1" strokeWidth={2} dot={false} /></LineChart>
                    </ResponsiveContainer>
                </div>
                <div className="card"><div className="card-header"><h3 className="card-title">Leads by Source</h3></div>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart><Pie data={bySource} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80}>{bySource.map((e, i) => <Cell key={i} fill={e.color} />)}</Pie><Tooltip /><Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} /></PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid-2 mb-6">
                {!isClient && (
                    <div className="card"><div className="card-header"><h3 className="card-title">Leads by Client</h3></div>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={byClient}><CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" /><XAxis dataKey="name" fontSize={11} /><YAxis fontSize={12} /><Tooltip /><Bar dataKey="leads" radius={[4, 4, 0, 0]} barSize={32}>{byClient.map((e, i) => <Cell key={i} fill={e.color} />)}</Bar></BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
                <div className={`card ${isClient ? 'col-span-2' : ''}`}><div className="card-header"><h3 className="card-title">Status Distribution</h3></div>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={byStatus} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} /><XAxis type="number" fontSize={12} /><YAxis type="category" dataKey="name" fontSize={11} width={120} /><Tooltip /><Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={16}>{byStatus.map((e, i) => <Cell key={i} fill={e.color} />)}</Bar></BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid-2">
                {!isClient && (
                    <div className="card"><div className="card-header"><h3 className="card-title">Team Assignment</h3></div>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={byAssignee}><XAxis dataKey="name" fontSize={11} /><YAxis fontSize={12} /><Tooltip /><Bar dataKey="leads" radius={[4, 4, 0, 0]} barSize={28}>{byAssignee.map((e, i) => <Cell key={i} fill={e.color} />)}</Bar></BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
                <div className={`card ${isClient ? 'col-span-2' : ''}`}><div className="card-header"><h3 className="card-title">Top Campaigns</h3></div>
                    <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                        {campaignData.map((c, i) => (
                            <div key={i} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--gray-100)' }}>
                                <span className="text-sm">{c.name}</span><span className="font-semibold text-sm">{c.count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
