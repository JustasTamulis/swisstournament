import axios from 'axios';

const api = axios.create({
  baseURL: '/api/',
  timeout: 5000,
  headers: { 'Content-Type': 'application/json' },
});

export const getSummary = async () => (await api.get('summary/')).data;
export const getStages = async () => (await api.get('stages/')).data;
export const getFeatures = async () => (await api.get('features/')).data;
export const getActivity = async () => (await api.get('activity/')).data;
export const advanceFeature = async (featureId) => (await api.post(`features/${featureId}/advance/`)).data;
export const seedTemplateData = async () => (await api.post('seed/')).data;

export default api;
