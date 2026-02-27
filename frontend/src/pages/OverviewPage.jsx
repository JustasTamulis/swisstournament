import { useState } from 'react'

import { useTemplate } from '../context/TemplateContext'

function OverviewPage() {
  const { overview, loading, error, bootstrapDemo } = useTemplate()
  const [bootstrapping, setBootstrapping] = useState(false)

  const handleBootstrap = async () => {
    setBootstrapping(true)
    try {
      await bootstrapDemo()
    } finally {
      setBootstrapping(false)
    }
  }

  if (loading && !overview) {
    return <p className="panel">Loading overview...</p>
  }

  return (
    <section className="page-stack">
      {error ? <p className="panel error-banner">{error}</p> : null}

      <div className="metrics-grid">
        <article className="metric-card">
          <p>Total Workspaces</p>
          <h2>{overview?.totals?.workspaces ?? 0}</h2>
        </article>
        <article className="metric-card">
          <p>Total Items</p>
          <h2>{overview?.totals?.items ?? 0}</h2>
        </article>
        <article className="metric-card">
          <p>Completed</p>
          <h2>{overview?.totals?.completed_items ?? 0}</h2>
        </article>
      </div>

      <article className="panel">
        <div className="panel-title-row">
          <h3>Status Breakdown</h3>
          <button className="ghost-btn" onClick={handleBootstrap} disabled={bootstrapping}>
            {bootstrapping ? 'Loading...' : 'Load Demo Data'}
          </button>
        </div>
        <div className="status-grid">
          {(overview?.status_breakdown ?? []).map((statusItem) => (
            <div key={statusItem.status} className="status-pill">
              <span>{statusItem.label}</span>
              <strong>{statusItem.count}</strong>
            </div>
          ))}
        </div>
      </article>

      <article className="panel">
        <h3>Recent Work Items</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Workspace</th>
                <th>Status</th>
                <th>Priority</th>
              </tr>
            </thead>
            <tbody>
              {(overview?.recent_items ?? []).map((item) => (
                <tr key={item.id}>
                  <td>{item.title}</td>
                  <td>{item.workspace_slug}</td>
                  <td>{item.status_label}</td>
                  <td>{item.priority_label}</td>
                </tr>
              ))}
              {overview?.recent_items?.length === 0 ? (
                <tr>
                  <td colSpan="4">No items yet. Use &quot;Load Demo Data&quot; or add one in Work Items.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  )
}

export default OverviewPage
