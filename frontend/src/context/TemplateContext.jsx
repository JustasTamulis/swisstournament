import { createContext, useCallback, useContext, useEffect, useState } from 'react'

import {
  advanceItemStatus,
  bootstrapTemplateData,
  createWorkItem,
  fetchActivity,
  fetchOverview,
  fetchWorkspaces,
  listWorkItems,
} from '../services/templateApi'

const TemplateContext = createContext(null)

export function TemplateProvider({ children }) {
  const [overview, setOverview] = useState(null)
  const [workspaces, setWorkspaces] = useState([])
  const [activity, setActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refreshAll = useCallback(async () => {
    setLoading(true)
    try {
      const [overviewData, workspaceData, activityData] = await Promise.all([
        fetchOverview(),
        fetchWorkspaces(),
        fetchActivity({ limit: 20 }),
      ])
      setOverview(overviewData)
      setWorkspaces(workspaceData)
      setActivity(activityData)
      setError('')
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to load template data.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshAll()
  }, [refreshAll])

  const bootstrapDemo = useCallback(async () => {
    const result = await bootstrapTemplateData()
    await refreshAll()
    return result
  }, [refreshAll])

  const loadItems = useCallback(async (filters = {}) => {
    return listWorkItems(filters)
  }, [])

  const createItem = useCallback(
    async (payload) => {
      const result = await createWorkItem(payload)
      await refreshAll()
      return result
    },
    [refreshAll],
  )

  const advanceItem = useCallback(
    async (itemId) => {
      const result = await advanceItemStatus(itemId)
      await refreshAll()
      return result
    },
    [refreshAll],
  )

  const value = {
    overview,
    workspaces,
    activity,
    loading,
    error,
    refreshAll,
    bootstrapDemo,
    loadItems,
    createItem,
    advanceItem,
  }

  return <TemplateContext.Provider value={value}>{children}</TemplateContext.Provider>
}

export function useTemplate() {
  const context = useContext(TemplateContext)
  if (!context) {
    throw new Error('useTemplate must be used within TemplateProvider')
  }
  return context
}
