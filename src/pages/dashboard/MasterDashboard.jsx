import React from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { Users, Inbox, TrendingUp, Clock, Flame, Target, ArrowUpRight, ArrowDownRight, Globe, Facebook, Chrome } from 'lucide-react';
import useStore from '../../data/store';
import './Dashboard.css';

const SOURCE_COLORS = { website: '#3b82f6', meta: '#8b5cf6', google_ads: '#f59e0b', manual: '#6b7280' };
const SOURCE_LABELS = { website: 'Website', meta: 'Meta Ads', google_ads: 'Google Ads', manual: 'Manual' };
const SOURCE_ICONS = { website: Globe, meta: Facebook, google_ads: Chrome, manual: Users };

export default function MasterDashboard() {
    const getOverallStats = useStore(s => s.getOverallStats);
    const stats = getOverallStats();
    const leads = useStore(s => s.leads);
    const clients = useStore(s => s.clients);
    const followUps = useStore(s => s.followUps);
    const activities = useStore(s => s.activities);
    const users = useStore(s => s.users);
    const getUser = useStore(s => s.getUser);
    const currentUser = useStore(s => s.currentUser);
    
    const isClient = currentUser?.role === 'client';

    // Chart data
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(Date.now() - (6 - i) * 86400000);
        const dayLeads = leads.filter(l => new Date(l.createdAt).toDateString() === date.toDateString());
        return { day: date.toLocaleDateString('en', { weekday: 'short' }), leads: dayLeads.length };
    });

    const sourceChartData = Object.entries(stats.bySource).filter(([, v]) => v > 0).map(([k, v]) => ({
        name: SOURCE_LABELS[k], value: v, color: SOURCE_COLORS[k]
    }));

    const pendingFollowUps = followUps.filter(f => !f.isCompleted).slice(0, 5);
    const recentActivities = activities.slice(-6).reverse();

    return (
        <div className="page-content">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Dashboard</h1>
                    <p className="page-subtitle">Welcome back, {useStore.getState().currentUser.name.split(' ')[0]}. Here's your agency overview.</p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid-4 mb-6">
                <div className="kpi-card" style={{ '--kpi-accent': '#6366f1' }}>
                    <div className="kpi-icon" style={{ background: '#eef2ff', color: '#6366f1' }}><Inbox size={22} /></div>
                    <div className="kpi-value">{stats.totalLeads}</div>
                    <div className="kpi-label">Total Leads</div>
                    <div className="kpi-change positive"><ArrowUpRight size={12} /> 12% this month</div>
                </div>
                <div className="kpi-card" style={{ '--kpi-accent': '#3b82f6' }}>
                    <div className="kpi-icon" style={{ background: '#dbeafe', color: '#3b82f6' }}><TrendingUp size={22} /></div>
                    <div className="kpi-value">{stats.newThisWeek}</div>
                    <div className="kpi-label">New This Week</div>
                    <div className="kpi-change positive"><ArrowUpRight size={12} /> 8%</div>
                </div>
                <div className="kpi-card" style={{ '--kpi-accent': '#10b981' }}>
                    <div className="kpi-icon" style={{ background: '#d1fae5', color: '#10b981' }}><Target size={22} /></div>
                    <div className="kpi-value">{stats.conversionRate}%</div>
                    <div className="kpi-label">Conversion Rate</div>
                    <div className="kpi-change positive"><ArrowUpRight size={12} /> 3%</div>
                </div>
                <div className="kpi-card" style={{ '--kpi-accent': '#f59e0b' }}>
                    <div className="kpi-icon" style={{ background: '#fef3c7', color: '#f59e0b' }}><Clock size={22} /></div>
                    <div className="kpi-value">{stats.followUpsDue}</div>
                    <div className="kpi-label">Follow-ups Due</div>
                    {stats.followUpsDue > 0 && <div className="kpi-change negative"><ArrowDownRight size={12} /> Action needed</div>}
                </div>
            </div>

            <div className="dashboard-grid">
                {/* Lead Trend Chart */}
                <div className="card">
                    <div className="card-header"><h3 className="card-title">Lead Trend (7 Days)</h3></div>
                    <ResponsiveContainer width="100%" height={240}>
                        <LineChart data={last7Days}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="day" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }} />
                            <Line type="monotone" dataKey="leads" stroke="#6366f1" strokeWidth={2.5} dot={{ fill: '#6366f1', r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Leads by Source */}
                <div className="card">
                    <div className="card-header"><h3 className="card-title">Leads by Source</h3></div>
                    <ResponsiveContainer width="100%" height={240}>
                        <PieChart>
                            <Pie data={sourceChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3}>
                                {sourceChartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                            </Pie>
                            <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }} />
                            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Leads by Client */}
                {!isClient && (
                    <div className="card">
                        <div className="card-header"><h3 className="card-title">Leads by Client</h3></div>
                        <ResponsiveContainer width="100%" height={240}>
                            <BarChart data={stats.byClient} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                                <XAxis type="number" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis type="category" dataKey="name" fontSize={12} tickLine={false} axisLine={false} width={100} />
                                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }} />
                                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={18}>
                                    {stats.byClient.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* Status Funnel */}
                <div className="card">
                    <div className="card-header"><h3 className="card-title">Lead Status Funnel</h3></div>
                    <div className="funnel-list">
                        {stats.byStatus.filter(s => s.count > 0).map(s => (
                            <div key={s.statusId} className="funnel-item">
                                <div className="funnel-label">
                                    <span className="status-dot" style={{ background: s.color }} />
                                    <span>{s.label}</span>
                                </div>
                                <div className="funnel-bar-wrap">
                                    <div className="funnel-bar" style={{ width: `${(s.count / stats.totalLeads) * 100}%`, background: s.color }} />
                                </div>
                                <span className="funnel-count">{s.count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Follow-ups Due */}
                <div className="card">
                    <div className="card-header"><h3 className="card-title">Follow-ups Due</h3></div>
                    <div className="followup-list">
                        {pendingFollowUps.map(f => {
                            const lead = leads.find(l => l.id === f.leadId);
                            const user = getUser(f.userId);
                            const isOverdue = new Date(f.dueDate) < new Date();
                            return (
                                <div key={f.id} className={`followup-item ${isOverdue ? 'overdue' : ''}`}>
                                    <div className="followup-info">
                                        <span className="font-medium">{lead?.fullName}</span>
                                        <span className="text-sm text-muted">{f.notes}</span>
                                    </div>
                                    <div className="followup-meta">
                                        <span className={`badge ${isOverdue ? 'badge-danger' : 'badge-warning'}`}>{isOverdue ? 'Overdue' : 'Today'}</span>
                                        <span className="text-xs text-muted">{f.type}</span>
                                    </div>
                                </div>
                            );
                        })}
                        {pendingFollowUps.length === 0 && <p className="text-sm text-muted" style={{ padding: 16 }}>No follow-ups due. You're all caught up! 🎉</p>}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="card">
                    <div className="card-header"><h3 className="card-title">Recent Activity</h3></div>
                    <div className="timeline">
                        {recentActivities.map(a => {
                            const user = getUser(a.userId);
                            return (
                                <div key={a.id} className="timeline-item">
                                    <div className="timeline-dot" />
                                    <div className="timeline-content">
                                        <span className="font-medium">{user?.name}</span> {a.description}
                                    </div>
                                    <div className="timeline-time">{new Date(a.createdAt).toLocaleDateString()}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
