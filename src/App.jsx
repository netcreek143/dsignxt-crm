import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import MasterDashboard from './pages/dashboard/MasterDashboard';
import ClientsListPage from './pages/clients/ClientsListPage';
import ClientDetailPage from './pages/clients/ClientDetailPage';
import LeadsPage from './pages/leads/LeadsPage';
import PipelinePage from './pages/pipeline/PipelinePage';
import IntegrationsPage from './pages/integrations/IntegrationsPage';
import AnalyticsPage from './pages/analytics/AnalyticsPage';
import TeamPage from './pages/team/TeamPage';
import SettingsPage from './pages/settings/SettingsPage';
import NotificationsPage from './pages/notifications/NotificationsPage';
import ClientAccessPage from './pages/clients/ClientAccessPage';
import LoginPage from './pages/auth/LoginPage';
import useStore from './data/store';

export default function App() {
    const { isAuth, login, currentUser, fetchClientsFromDb, fetchIntegrationsFromDb, fetchLeadsFromDb, fetchUsersFromDb } = useStore();

    React.useEffect(() => {
        if (isAuth) {
            fetchClientsFromDb();
            fetchIntegrationsFromDb();
            fetchLeadsFromDb();
            fetchUsersFromDb();
        }
    }, [isAuth]);

    if (!isAuth) return <LoginPage onLogin={() => { }} />;

    const isSuperAdmin = currentUser?.role === 'super_admin';
    const isClient = currentUser?.role === 'client';
    
    // Check if user has permission. Superadmins always have access.
    const hasPerm = (p) => isSuperAdmin || (currentUser?.permissions && JSON.parse(currentUser.permissions).includes(p));

    return (
        <BrowserRouter>
            <Routes>
                <Route element={<AppLayout />}>
                    <Route path="/" element={<MasterDashboard />} />
                    
                    {/* Agency Restricted */}
                    <Route path="/clients" element={hasPerm('clients') ? <ClientsListPage /> : <Forbidden />} />
                    <Route path="/clients/:clientId" element={hasPerm('clients') ? <ClientDetailPage /> : <Forbidden />} />
                    <Route path="/client-access" element={isSuperAdmin ? <ClientAccessPage /> : <Forbidden />} />
                    
                    <Route path="/leads" element={hasPerm('leads') ? <LeadsPage /> : <Forbidden />} />
                    <Route path="/pipeline" element={hasPerm('pipeline') ? <PipelinePage /> : <Forbidden />} />

                    {/* Admin/SuperAdmin Restricted */}
                    <Route path="/integrations" element={hasPerm('integrations') ? <IntegrationsPage /> : <Forbidden />} />
                    <Route path="/team" element={hasPerm('team') ? <TeamPage /> : <Forbidden />} />

                    {/* General */}
                    <Route path="/analytics" element={hasPerm('analytics') ? <AnalyticsPage /> : <Forbidden />} />
                    <Route path="/notifications" element={<NotificationsPage />} />
                    <Route path="/settings" element={hasPerm('settings') ? <SettingsPage /> : <Forbidden />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

function Forbidden() {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted">You do not have permission to view this page. Please contact your administrator.</p>
        </div>
    );
}
