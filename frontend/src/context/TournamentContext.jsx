import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { getActivity, getFeatures, getStages, getSummary, seedTemplateData } from '../services/tournamentService';

const AppTemplateContext = createContext(null);

export const AppTemplateProvider = ({ children }) => {
  const [summary, setSummary] = useState(null);
  const [stages, setStages] = useState([]);
  const [features, setFeatures] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [summaryData, stagesData, featuresData, activityData] = await Promise.all([
        getSummary(),
        getStages(),
        getFeatures(),
        getActivity(),
      ]);
      setSummary(summaryData);
      setStages(stagesData);
      setFeatures(featuresData);
      setActivity(activityData);
    } finally {
      setLoading(false);
    }
  }, []);

  const initializeTemplate = useCallback(async () => {
    try {
      await seedTemplateData();
    } catch {
      // Seed endpoint may return 400 if data already exists; safe to ignore for template bootstrap.
    }
    await refresh();
  }, [refresh]);

  useEffect(() => {
    initializeTemplate();
  }, [initializeTemplate]);

  return (
    <AppTemplateContext.Provider value={{ summary, stages, features, activity, loading, refresh }}>
      {children}
    </AppTemplateContext.Provider>
  );
};

AppTemplateProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

const useAppTemplate = () => {
  const context = useContext(AppTemplateContext);
  if (!context) {
    throw new Error('useAppTemplate must be used within AppTemplateProvider');
  }
  return context;
};

export default useAppTemplate;
