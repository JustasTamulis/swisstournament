import axios from 'axios'

const api = axios.create({
  baseURL: '/api/',
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
    accept: 'application/json',
  },
})

export const fetchOverview = async () => {
  const response = await api.get('overview/')
  return response.data
}

export const fetchWorkspaces = async () => {
  const response = await api.get('workspaces/')
  return response.data
}

export const fetchActivity = async (params = {}) => {
  const response = await api.get('activity/', { params })
  return response.data
}

export const listWorkItems = async (params = {}) => {
  const response = await api.get('items/', { params })
  return response.data
}

export const createWorkItem = async (payload) => {
  const response = await api.post('items/', payload)
  return response.data
}

export const advanceItemStatus = async (itemId) => {
  const response = await api.post(`items/${itemId}/advance-status/`)
  return response.data
}

export const bootstrapTemplateData = async () => {
  const response = await api.post('bootstrap/')
  return response.data
}

export default api
