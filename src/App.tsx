import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Home } from './pages/Home';
import { Visualizer } from './apps/cpu_scheduler/Page';
import { About } from './pages/About';
import { Architecture } from './pages/Architecture';
import { Console } from './pages/Console';
import { AdminLogin } from './pages/admin/Login';
import { AdminLayout } from './pages/admin/AdminLayout';
import { Overview } from './pages/admin/Overview';
import { Inbox } from './pages/admin/Inbox';
import { FeaturedManager } from './pages/admin/FeaturedManager';
import { DatabaseExplorer } from './pages/admin/DatabaseExplorer';
import { SQLEditor } from './pages/admin/SQLEditor';
import { SystemConfig } from './pages/admin/SystemConfig';

import { Roadmap } from './pages/Roadmap';
import { Changelog } from './pages/Changelog';
import { ShellMakerPage } from './apps/shell_maker/Page';
import SysCoreVisualizer from './apps/visualizer/Page';
import { Documentation } from './pages/Documentation';
import { OSConcepts } from './pages/OSConcepts';
import { AlgoWiki } from './pages/AlgoWiki';
import { ReportBug, RequestFeature, Contributing } from './pages/CommunityPages';
import { Privacy } from './pages/legal/Privacy';
import { Terms } from './pages/legal/Terms';

import { supabase } from './lib/supabase';
import { SponsorManager } from './pages/admin/SponsorManager';
import { Sponsor } from './pages/Sponsor';
import { NotFound } from './pages/NotFound';
import { Maintenance } from './pages/Maintenance';
import { useSystemConfig } from './hooks/useSystemConfig';

function App() {
  const navigate = useNavigate();

  React.useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Rescue Admin: If signed in, check if this was an intentional admin login
      if (event === 'SIGNED_IN' && session?.user?.email) {
        const intent = localStorage.getItem('syscore_auth_intent');

        if (intent === 'true') {
          // Clear intent so they can browse normally later
          localStorage.removeItem('syscore_auth_intent');

          const { data } = await supabase.from('admin_whitelist').select('email').eq('email', session.user.email).single();
          if (data) {
            console.log('Admin Login verified, redirecting to dashboard...');
            navigate('/root/dashboard');
          }
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const { config, loading } = useSystemConfig();

  if (!loading && config.status !== 'ONLINE') {
    // Allow admin access or show maintenance
    // For now, simple global maintenance, but maybe we want to allow /admin?
    // Let's check path.
    if (!location.pathname.startsWith('/root')) {
      return <Maintenance message={config.motd} status={config.status} />;
    }
  }

  return (
    <Routes>

      <Route path="/" element={<Home />} /> {/* Landing Page */}
      <Route path="/dev/scheduler" element={<Visualizer />} />
      <Route path="/dev/about" element={<About />} />
      <Route path="/dev/architecture" element={<Architecture />} />
      <Route path="/dev/console" element={<Console />} />

      {/* Admin Area */}
      <Route path="/root" element={<AdminLogin />} />
      <Route element={<AdminLayout />}>
        <Route path="/root/dashboard" element={<Overview />} />
        <Route path="/root/inbox" element={<Inbox />} />
        <Route path="/root/featured" element={<FeaturedManager />} />
        <Route path="/root/config" element={<SystemConfig />} />
        <Route path="/root/database" element={<DatabaseExplorer />} />
        <Route path="/root/sql" element={<SQLEditor />} />
        <Route path="/root/sponsor" element={<SponsorManager />} />
      </Route>

      <Route path="/dev/roadmap" element={<Roadmap />} />
      <Route path="/dev/shell" element={<ShellMakerPage />} />
      <Route path="/dev/changelog" element={<Changelog />} />

      {/* Content Pages */}
      <Route path="/dev/docs" element={<Documentation />} />
      <Route path="/dev/os-concepts" element={<OSConcepts />} />
      <Route path="/dev/algo-wiki" element={<AlgoWiki />} />

      {/* Community Pages */}
      <Route path="/dev/bug-report" element={<ReportBug />} />
      <Route path="/dev/feature-request" element={<RequestFeature />} />
      <Route path="/dev/contributing" element={<Contributing />} />

      {/* Legal Pages */}
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/sponsor" element={<Sponsor />} />

      {/* Fallback for old Links */}
      <Route path="/visualizer" element={<Visualizer />} />
      <Route path="/dev/execution" element={<SysCoreVisualizer />} />
      <Route path="/console" element={<Console />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
