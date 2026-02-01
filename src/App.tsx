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
import { Documentation } from './pages/Documentation';
import { OSConcepts } from './pages/OSConcepts';
import { AlgoWiki } from './pages/AlgoWiki';
import { ReportBug, RequestFeature, Contributing } from './pages/CommunityPages';
import { Privacy } from './pages/legal/Privacy';
import { Terms } from './pages/legal/Terms';

import { supabase } from './lib/supabase';

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
            navigate('/admin/dashboard');
          }
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <Routes>
      <Route path="/" element={<Home />} /> {/* Landing Page */}
      <Route path="/dev/scheduler" element={<Visualizer />} />
      <Route path="/dev/about" element={<About />} />
      <Route path="/dev/architecture" element={<Architecture />} />
      <Route path="/dev/console" element={<Console />} />

      {/* Admin Area */}
      <Route path="/admin" element={<AdminLogin />} />
      <Route element={<AdminLayout />}>
        <Route path="/admin/dashboard" element={<Overview />} />
        <Route path="/admin/inbox" element={<Inbox />} />
        <Route path="/admin/featured" element={<FeaturedManager />} />
        <Route path="/admin/config" element={<SystemConfig />} />
        <Route path="/admin/database" element={<DatabaseExplorer />} />
        <Route path="/admin/sql" element={<SQLEditor />} />
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

      {/* Fallback for old Links */}
      <Route path="/visualizer" element={<Visualizer />} />
      <Route path="/console" element={<Console />} />
    </Routes>
  );
}

export default App;
