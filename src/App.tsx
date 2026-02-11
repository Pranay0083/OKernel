import React from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
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
import AppLayout from './apps/visualizer/components/AppLayout';
import ComparePage from './apps/visualizer/ComparePage';
import { AuthPage } from './pages/auth/AuthPage';
import { AuthGuard } from './components/auth/AuthGuard';
import { SympathyLanding } from './apps/visualizer/LandingPage';
import { DocsLayout } from './apps/docs/DocsLayout';
import { DOCS_NAVIGATION } from './apps/docs/DocsConfig';
import { WIKI_NAVIGATION } from './pages/wiki/AlgoWikiConfig';
import { ARCH_NAVIGATION } from './pages/os_arch/OSArchConfig';
import ScrollToTop from './components/ScrollToTop';
import { Dashboard } from './pages/Dashboard';

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
    <>
      <ScrollToTop />
      <Routes>
  
        <Route path="/" element={<Home />} /> {/* Landing Page */}
      <Route path="/scheduler" element={<Visualizer />} />
      <Route path="/about" element={<About />} />
      <Route path="/architecture" element={<Architecture />} />
      <Route path="/console" element={<Console />} />

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

      <Route path="/roadmap" element={<Roadmap />} />
      <Route path="/shell" element={<ShellMakerPage />} />
      <Route path="/changelog" element={<Changelog />} />

      {/* Documentation Hub */}
      <Route path="/docs" element={<DocsLayout />}>
        {DOCS_NAVIGATION.flatMap(section => section.items).map(item => {
           // Calculate relative path: /docs/architecture -> architecture
           // /docs -> index
           const relativePath = item.path === '/docs' ? undefined : item.path.replace('/docs/', '');
           return (
             <Route 
                key={item.id} 
                index={item.path === '/docs'} 
                path={relativePath} 
                element={item.component} 
             />
           );
        })}
      </Route>

      <Route path="/os-concepts" element={<OSConcepts />}>
        {ARCH_NAVIGATION.flatMap(section => section.items).map(item => {
           // /os-concepts -> index route
           const relativePath = item.path === '/os-concepts' ? undefined : item.path.replace('/os-concepts/', '');
           return (
             <Route 
                key={item.id} 
                index={item.path === '/os-concepts'} 
                path={relativePath} 
                element={item.component} 
             />
           );
        })}
      </Route>
      <Route path="/algo-wiki" element={<AlgoWiki />}>
        {WIKI_NAVIGATION.flatMap(section => section.items).map(item => {
           // /algo-wiki -> index route
           const relativePath = item.path === '/algo-wiki' ? undefined : item.path.replace('/algo-wiki/', '');
           return (
             <Route 
                key={item.id} 
                index={item.path === '/algo-wiki'} 
                path={relativePath} 
                element={item.component} 
             />
           );
        })}
      </Route>

      {/* Community Pages */}
      <Route path="/bug-report" element={<ReportBug />} />
      <Route path="/feature-request" element={<RequestFeature />} />
      <Route path="/contributing" element={<Contributing />} />

      {/* Legal Pages */}
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/sponsor" element={<Sponsor />} />

      <Route path="/auth" element={<AuthPage />} />

      {/* User Dashboard */}
      <Route path="/dashboard" element={
        <AuthGuard>
          <Dashboard />
        </AuthGuard>
      } />

      {/* Legacy Redirects */}
      <Route path="/dev/scheduler" element={<Navigate to="/scheduler" replace />} />
      <Route path="/dev/about" element={<Navigate to="/about" replace />} />
      <Route path="/dev/architecture" element={<Navigate to="/architecture" replace />} />
      <Route path="/dev/console" element={<Navigate to="/console" replace />} />
      <Route path="/dev/roadmap" element={<Navigate to="/roadmap" replace />} />
      <Route path="/dev/shell" element={<Navigate to="/shell" replace />} />
      <Route path="/dev/changelog" element={<Navigate to="/changelog" replace />} />
      <Route path="/dev/docs" element={<Navigate to="/docs" replace />} />
      <Route path="/dev/os-concepts" element={<Navigate to="/os-concepts" replace />} />
      <Route path="/dev/algo-wiki" element={<Navigate to="/algo-wiki" replace />} />
      <Route path="/dev/bug-report" element={<Navigate to="/bug-report" replace />} />
      <Route path="/dev/feature-request" element={<Navigate to="/feature-request" replace />} />
      <Route path="/dev/contributing" element={<Navigate to="/contributing" replace />} />
      <Route path="/dev/sympathy" element={<Navigate to="/platform/sympathy" replace />} />
      <Route path="/dev/sympathy/platform" element={<Navigate to="/platform/sympathy" replace />} />
      <Route path="/dev/sympathy/platform:cpu" element={<Navigate to="/platform/cpu" replace />} />
      <Route path="/dev/sympathy/platform:mem" element={<Navigate to="/platform/mem" replace />} />
      <Route path="/dev/sympathy/platform:compare" element={<Navigate to="/platform/compare" replace />} />
      <Route path="/dev/sympathy/platform:hardware" element={<Navigate to="/platform/hardware" replace />} />
      <Route path="/dev/sympathy/platform:recursion" element={<Navigate to="/platform/recursion" replace />} />

      {/* Fallback for old Links */}
      <Route path="/visualizer" element={<Navigate to="/scheduler" replace />} />
      <Route path="/platform" element={<Navigate to="/platform/sympathy" replace />} />

      {/* Public Landing Page - No Sidebar */}
      <Route path="/platform/sympathy" element={<SympathyLanding />} />

      {/* OKernel Visualizer Routes (Wrapped in App Shell) */}
      <Route element={<AppLayout />}>
        {/* Protected Visualizer */}
        <Route path="/platform/compare" element={
          <AuthGuard>
            <ComparePage />
          </AuthGuard>
        } />
        <Route path="/platform/:mode" element={
          <AuthGuard>
            <SysCoreVisualizer />
          </AuthGuard>
        } />
      </Route>

      <Route path="/console" element={<Console />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
    </>
  );
}

export default App;
