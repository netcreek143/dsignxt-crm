import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Bell, Menu, X, LogOut, User, Settings } from 'lucide-react';
import useStore from '../../data/store';
import './TopHeader.css';

export default function TopHeader() {
    const { currentUser, searchQuery, setSearchQuery, getUnreadNotifications, markNotificationRead, notifications, logout } = useStore();
    const [showNotifs, setShowNotifs] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const unread = notifications.filter(n => !n.isRead);
    const notifRef = useRef();
    const profileRef = useRef();

    useEffect(() => {
        const handleClick = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false);
            if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const pathTitle = {
        '/': 'Dashboard', '/clients': 'Clients', '/leads': 'Leads', '/pipeline': 'Pipeline',
        '/integrations': 'Integrations', '/analytics': 'Analytics', '/team': 'Team', '/settings': 'Settings',
    };

    return (
        <header className="top-header">
            <div className="header-left">
                <h2 className="header-title">{pathTitle[location.pathname] || 'Dashboard'}</h2>
            </div>

            <div className="header-center">
                <div className="global-search">
                    <Search size={16} />
                    <input type="text" placeholder="Search leads, clients, campaigns..." value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && searchQuery) navigate(`/leads?search=${searchQuery}`); }}
                    />
                </div>
            </div>

            <div className="header-right">
                <div className="header-notif" ref={notifRef}>
                    <button className="header-icon-btn" onClick={() => setShowNotifs(!showNotifs)}>
                        <Bell size={20} />
                        {unread.length > 0 && <span className="notification-count">{unread.length}</span>}
                    </button>
                    {showNotifs && (
                        <div className="notif-dropdown">
                            <div className="notif-header">
                                <span className="notif-title">Notifications</span>
                                {unread.length > 0 && <span className="text-sm text-muted">{unread.length} new</span>}
                            </div>
                            <div className="notif-list">
                                {notifications.slice(0, 8).map(n => (
                                    <div key={n.id} className={`notif-item ${n.isRead ? '' : 'unread'}`}
                                        onClick={() => { markNotificationRead(n.id); if (n.link) navigate(n.link); setShowNotifs(false); }}>
                                        <div className={`notif-icon-dot ${n.type}`} />
                                        <div className="notif-content">
                                            <p className="notif-msg">{n.message}</p>
                                            <span className="notif-time">{new Date(n.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="header-profile" ref={profileRef}>
                    <button className="profile-btn" onClick={() => setShowProfile(!showProfile)}>
                        <div className="avatar" style={{ background: currentUser.color }}>{currentUser.initials}</div>
                        <span className="profile-name">{currentUser.name}</span>
                    </button>
                    {showProfile && (
                        <div className="profile-dropdown">
                            <div className="profile-info">
                                <div className="avatar avatar-lg" style={{ background: currentUser.color }}>{currentUser.initials}</div>
                                <div><p className="font-medium">{currentUser.name}</p><p className="text-sm text-muted">{currentUser.email}</p></div>
                            </div>
                            <div className="dropdown-divider" />
                            <button className="dropdown-item" onClick={() => { navigate('/settings'); setShowProfile(false); }}><Settings size={16} /> Settings</button>
                            <button className="dropdown-item" onClick={() => { logout(); navigate('/'); }}><LogOut size={16} /> Sign Out</button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
