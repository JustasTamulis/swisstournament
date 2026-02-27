import { NavLink, Navigate, Route, Routes } from 'react-router-dom'

import { TemplateProvider, useTemplate } from './context/TemplateContext'
import ActivityPage from './pages/ActivityPage'
import OverviewPage from './pages/OverviewPage'
import WorkItemsPage from './pages/WorkItemsPage'

const navItems = [
  { to: '/overview', label: 'Overview' },
  { to: '/items', label: 'Work Items' },
  { to: '/activity', label: 'Activity' },
]

function Shell() {
  const { refreshAll, loading } = useTemplate()

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Web App Starter Template</p>
          <h1>Full-Stack Example</h1>
        </div>
        <button className="ghost-btn" onClick={refreshAll} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </header>

      <nav className="top-nav" aria-label="Main navigation">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              isActive ? 'top-nav-link top-nav-link-active' : 'top-nav-link'
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/overview" replace />} />
          <Route path="/overview" element={<OverviewPage />} />
          <Route path="/items" element={<WorkItemsPage />} />
          <Route path="/activity" element={<ActivityPage />} />
        </Routes>
      </main>
    </div>
  )
}

function App() {
  return (
    <TemplateProvider>
      <Shell />
    </TemplateProvider>
  )
}

export default App
