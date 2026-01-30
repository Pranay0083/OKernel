import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Visualizer } from './apps/cpu_scheduler/Page';
import { About } from './pages/About';
import { Architecture } from './pages/Architecture';
import { Console } from './pages/Console';
import { AdminLogin } from './pages/admin/Login';
// import { AdminDashboard } from './pages/admin/Dashboard'; // Deprecated
import { AdminLayout } from './pages/admin/AdminLayout';
import { Overview } from './pages/admin/Overview';
import { Inbox } from './pages/admin/Inbox';
import { FeaturedManager } from './pages/admin/FeaturedManager';
import { DatabaseExplorer } from './pages/admin/DatabaseExplorer';
import { SQLEditor } from './pages/admin/SQLEditor';

import { Roadmap } from './pages/Roadmap';
import { Changelog } from './pages/Changelog';
import { Documentation } from './pages/Documentation';
import { OSConcepts } from './pages/OSConcepts';
import { AlgoWiki } from './pages/AlgoWiki';
import { ReportBug, RequestFeature, Contributing } from './pages/CommunityPages';

function App() {
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
        <Route path="/admin/database" element={<DatabaseExplorer />} />
        <Route path="/admin/sql" element={<SQLEditor />} />
      </Route>

      <Route path="/dev/roadmap" element={<Roadmap />} />
      <Route path="/dev/changelog" element={<Changelog />} />

      {/* Content Pages */}
      <Route path="/dev/docs" element={<Documentation />} />
      <Route path="/dev/os-concepts" element={<OSConcepts />} />
      <Route path="/dev/algo-wiki" element={<AlgoWiki />} />

      {/* Community Pages */}
      <Route path="/dev/bug-report" element={<ReportBug />} />
      <Route path="/dev/feature-request" element={<RequestFeature />} />
      <Route path="/dev/contributing" element={<Contributing />} />

      {/* Fallback for old Links */}
      <Route path="/visualizer" element={<Visualizer />} />
      <Route path="/console" element={<Console />} />
    </Routes>
  );
}

export default App;
