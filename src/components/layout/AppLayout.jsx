import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';
import AIChatWidget from '../ai/AIChatWidget';
import useStore from '../../data/store';
import './AppLayout.css';

export default function AppLayout() {
    const collapsed = useStore(s => s.sidebarCollapsed);
    return (
        <div className={`app-layout ${collapsed ? 'sidebar-collapsed' : ''}`}>
            <Sidebar />
            <div className="app-main">
                <TopHeader />
                <main className="app-content">
                    <Outlet />
                </main>
            </div>
            <AIChatWidget />
        </div>
    );
}
