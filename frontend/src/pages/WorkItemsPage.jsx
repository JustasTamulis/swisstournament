import { useCallback, useEffect, useMemo, useState } from 'react'

import { useTemplate } from '../context/TemplateContext'

const statusOptions = ['backlog', 'in_progress', 'review', 'done']
const priorityOptions = ['low', 'medium', 'high']

function WorkItemsPage() {
  const { workspaces, loadItems, createItem, advanceItem } = useTemplate()

  const [filters, setFilters] = useState({ workspace: '', status: '' })
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [formState, setFormState] = useState({
    workspace: '',
    title: '',
    owner: '',
    priority: 'medium',
    summary: '',
  })

  useEffect(() => {
    if (!formState.workspace && workspaces.length > 0) {
      setFormState((prev) => ({ ...prev, workspace: String(workspaces[0].id) }))
    }
  }, [formState.workspace, workspaces])

  const activeFilters = useMemo(() => {
    const nextFilters = {}
    if (filters.workspace) {
      nextFilters.workspace = filters.workspace
    }
    if (filters.status) {
      nextFilters.status = filters.status
    }
    return nextFilters
  }, [filters])

  const refreshItems = useCallback(async () => {
    setLoading(true)
    try {
      const data = await loadItems(activeFilters)
      setItems(data)
      setError('')
    } catch {
      setError('Failed to load work items.')
    } finally {
      setLoading(false)
    }
  }, [activeFilters, loadItems])

  useEffect(() => {
    refreshItems()
  }, [refreshItems])

  const handleCreate = async (event) => {
    event.preventDefault()
    if (!formState.workspace || !formState.title.trim()) {
      setError('Workspace and title are required.')
      return
    }

    setSubmitting(true)
    try {
      await createItem({
        workspace: Number(formState.workspace),
        title: formState.title.trim(),
        owner: formState.owner.trim(),
        priority: formState.priority,
        summary: formState.summary.trim(),
      })

      setFormState((prev) => ({
        ...prev,
        title: '',
        owner: '',
        summary: '',
        priority: 'medium',
      }))
      setError('')
      await refreshItems()
    } catch {
      setError('Failed to create work item.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAdvance = async (itemId) => {
    try {
      await advanceItem(itemId)
      await refreshItems()
      setError('')
    } catch {
      setError('Failed to update item status.')
    }
  }

  return (
    <section className="page-stack">
      {error ? <p className="panel error-banner">{error}</p> : null}

      <article className="panel">
        <h3>Create Work Item</h3>
        <form className="form-grid" onSubmit={handleCreate}>
          <label>
            Workspace
            <select
              value={formState.workspace}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, workspace: event.target.value }))
              }
            >
              {workspaces.map((workspace) => (
                <option key={workspace.id} value={workspace.id}>
                  {workspace.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Title
            <input
              value={formState.title}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, title: event.target.value }))
              }
              placeholder="Implement notifications"
            />
          </label>

          <label>
            Owner
            <input
              value={formState.owner}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, owner: event.target.value }))
              }
              placeholder="Frontend"
            />
          </label>

          <label>
            Priority
            <select
              value={formState.priority}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, priority: event.target.value }))
              }
            >
              {priorityOptions.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          </label>

          <label className="full-width">
            Summary
            <textarea
              value={formState.summary}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, summary: event.target.value }))
              }
              rows={3}
              placeholder="Short implementation note"
            />
          </label>

          <button type="submit" className="solid-btn" disabled={submitting}>
            {submitting ? 'Saving...' : 'Create Item'}
          </button>
        </form>
      </article>

      <article className="panel">
        <div className="panel-title-row">
          <h3>Items</h3>
          <div className="filter-row">
            <select
              value={filters.workspace}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, workspace: event.target.value }))
              }
            >
              <option value="">All workspaces</option>
              {workspaces.map((workspace) => (
                <option key={workspace.id} value={workspace.slug}>
                  {workspace.name}
                </option>
              ))}
            </select>
            <select
              value={filters.status}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, status: event.target.value }))
              }
            >
              <option value="">All statuses</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? <p>Loading items...</p> : null}

        <div className="item-grid">
          {items.map((item) => (
            <article key={item.id} className="item-card">
              <div>
                <p className="item-title">{item.title}</p>
                <p className="item-summary">{item.summary || 'No summary provided.'}</p>
              </div>
              <div className="item-meta">
                <span>{item.workspace_slug}</span>
                <span>{item.status_label}</span>
                <span>{item.priority_label}</span>
                <span>{item.owner || 'Unassigned'}</span>
              </div>
              <button
                className="ghost-btn"
                onClick={() => handleAdvance(item.id)}
                disabled={item.status === 'done'}
              >
                {item.status === 'done' ? 'Completed' : 'Advance Status'}
              </button>
            </article>
          ))}
          {items.length === 0 && !loading ? (
            <p className="item-empty">No matching items for current filters.</p>
          ) : null}
        </div>
      </article>
    </section>
  )
}

export default WorkItemsPage
