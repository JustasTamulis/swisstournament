import React, { createContext, useState, useEffect, useCallback } from 'react';
import { getRoundInfo } from '../services/tournamentService';
import { useLocation } from 'react-router-dom';

export const TournamentContext = createContext();

export const TournamentProvider = ({ children }) => {
    const [roundInfo, setRoundInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const location = useLocation();
    
    // Extract current page from path
    const currentPage = location.pathname.split('/').filter(Boolean)[0] || 'track';
    
    // Fetch round info - this is common data needed by all pages
    const fetchRoundInfo = useCallback(async () => {
        try {
            const data = await getRoundInfo();
            setRoundInfo(data);
            setError(null);
        } catch (err) {
            console.error("Error fetching round info:", err);
            setError("Failed to fetch tournament information");
        } finally {
            setLoading(false);
        }
    }, []);
    
    // Initial fetch on component mount
    useEffect(() => {
        fetchRoundInfo();
        
        // Set up polling for round info (this runs constantly but is lightweight)
        const roundInfoInterval = setInterval(fetchRoundInfo, 10000);
        
        return () => {
            clearInterval(roundInfoInterval);
        };
    }, [fetchRoundInfo]);
    
    // Context value
    const value = {
        roundInfo,
        loading,
        error,
        currentPage,
        refreshRoundInfo: fetchRoundInfo
    };
    
    return (
        <TournamentContext.Provider value={value}>
            {children}
        </TournamentContext.Provider>
    );
};

// Custom hook to use the tournament context
export const useTournament = () => {
    const context = React.useContext(TournamentContext);
    if (context === undefined) {
        throw new Error('useTournament must be used within a TournamentProvider');
    }
    return context;
};
