import { useTemplate } from '../context/TemplateContext'

function ActivityPage() {
  const { activity, loading } = useTemplate()

  return (
    <section className="page-stack">
      <article className="panel">
        <h3>Recent Activity</h3>
        {loading && activity.length === 0 ? <p>Loading activity...</p> : null}

        <div className="activity-timeline">
          {activity.map((entry) => (
            <div key={entry.id} className="activity-item">
              <div className="activity-dot" aria-hidden="true" />
              <div>
                <p className="activity-message">{entry.message}</p>
                <p className="activity-meta">
                  <span>{entry.action_label}</span>
                  <span>{entry.workspace_slug}</span>
                  <span>{new Date(entry.created_at).toLocaleString()}</span>
                </p>
              </div>
            </div>
          ))}
          {activity.length === 0 && !loading ? (
            <p>No activity yet. Add demo data or create a work item.</p>
          ) : null}
        </div>
      </article>
    </section>
  )
}

export default ActivityPage
