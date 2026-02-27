import { NavLink, Route, Routes } from 'react-router-dom';
import { AppTemplateProvider } from './context/TournamentContext';
import DashboardPage from './components/pages/DashboardPage';
import FeaturesPage from './components/pages/FeaturesPage';
import ActivityPage from './components/pages/ActivityPage';
import SetupPage from './components/pages/SetupPage';
import './App.css';

const AppShell = () => (
  <div className="app-shell">
    <header>
      <h1>Web App Starter Template</h1>
      <p>Example full-stack layout with Django API + React UI.</p>
      <nav>
        <NavLink to="/" end>Dashboard</NavLink>
        <NavLink to="/features">Features</NavLink>
        <NavLink to="/activity">Activity</NavLink>
        <NavLink to="/setup">Setup Guide</NavLink>
      </nav>
    </header>

    <main>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/activity" element={<ActivityPage />} />
        <Route path="/setup" element={<SetupPage />} />
      </Routes>
    </main>
  </div>
);

const App = () => (
  <AppTemplateProvider>
    <AppShell />
  </AppTemplateProvider>
);

export default App;
