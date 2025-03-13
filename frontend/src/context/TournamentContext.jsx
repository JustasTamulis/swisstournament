import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { getRoundInfo, getTournamentSettings } from '../services/tournamentService';
import { useLocation } from 'react-router-dom';

export const TournamentContext = createContext();

export const TournamentProvider = ({ children }) => {
    const [roundInfo, setRoundInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [roundChanged, setRoundChanged] = useState(false);
    const [finishDistance, setFinishDistance] = useState(12); // Temporary default
    const previousRoundInfoRef = useRef(null);
    
    const location = useLocation();
    
    // Extract current page from path
    const currentPage = location.pathname.split('/').filter(Boolean)[0] || 'track';
    
    // Fetch tournament settings like finish distance
    const fetchTournamentSettings = useCallback(async () => {
        try {
            const data = await getTournamentSettings();
            if (data && data.finish_distance) {
                setFinishDistance(data.finish_distance);
            }
        } catch (err) {
            console.error("Error fetching tournament settings:", err);
        }
    }, []);

    // Fetch round info - this is common data needed by all pages
    const fetchRoundInfo = useCallback(async () => {
        try {
            const data = await getRoundInfo();
            
            // Check if round or stage has changed - only trigger changes when needed
            if (previousRoundInfoRef.current && (
                previousRoundInfoRef.current.number !== data.number || 
                previousRoundInfoRef.current.stage !== data.stage
            )) {
                console.log('Round or stage changed - triggering updates');
                setRoundChanged(true);
                // Reset the flag after a delay to allow components to react
                setTimeout(() => setRoundChanged(false), 200);
            }
            
            // Update ref for future comparisons
            previousRoundInfoRef.current = {...data};
            
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
        // Get tournament settings first
        fetchTournamentSettings();
        
        // Then get round info
        fetchRoundInfo();
        
        // Set up polling for round info (this runs constantly but is lightweight)
        const roundInfoInterval = setInterval(fetchRoundInfo, 10000);
        
        return () => {
            clearInterval(roundInfoInterval);
        };
    }, [fetchRoundInfo, fetchTournamentSettings]);
    
    // Context value
    const value = {
        roundInfo,
        loading,
        error,
        currentPage,
        roundChanged,
        finishDistance,
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
