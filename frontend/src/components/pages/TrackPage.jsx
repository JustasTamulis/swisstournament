import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Paper, CircularProgress, Alert } from '@mui/material';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import { useSearchParams } from 'react-router-dom';
import { getAllTeams, getTeamByIdentifier } from '../../services/tournamentService';
import { useTournament } from '../../context/TournamentContext';

const TrackPage = () => {
    const [searchParams] = useSearchParams();
    const [teams, setTeams] = useState([]);
    const [playerTeam, setPlayerTeam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [animating, setAnimating] = useState(false);
    const prevTeamsRef = useRef([]);
    const animationTimeout = useRef(null);
    const pollingInterval = useRef(null);
    
    // Get tournament context
    const { currentPage, roundInfo } = useTournament();
    
    // Get the player_id from URL params
    const playerId = searchParams.get('player_id');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError('');
                
                // Fetch all teams
                const teamsData = await getAllTeams();
                
                // Sort teams by distance (descending)
                const sortedTeams = teamsData.sort((a, b) => b.distance - a.distance);
                
                // Check if we need to animate
                const shouldAnimate = prevTeamsRef.current.length > 0 && 
                    JSON.stringify(prevTeamsRef.current.map(t => t.distance)) !== 
                    JSON.stringify(sortedTeams.map(t => t.distance));
                
                // If we have previous data and there are changes, animate
                if (shouldAnimate) {
                    setAnimating(true);
                    // Start with previous positions
                    setTeams([...prevTeamsRef.current]);
                    
                    // After a short delay, update to new positions
                    animationTimeout.current = setTimeout(() => {
                        setTeams(sortedTeams);
                        setAnimating(false);
                    }, 500);
                } else {
                    // No animation needed, just update
                    setTeams(sortedTeams);
                }
                
                // Store current teams for next comparison
                prevTeamsRef.current = sortedTeams;
                
                // If player_id is provided, find the player's team
                if (playerId) {
                    const playerTeamData = await getTeamByIdentifier(playerId);
                    if (playerTeamData) {
                        setPlayerTeam(playerTeamData);
                    }
                }
            } catch (err) {
                console.error("Error fetching track data:", err);
                setError('Failed to load track data. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        
        // Initial fetch
        fetchData();
        
        // Only set up polling if this is the current page
        if (currentPage === 'track' || currentPage === '') {
            pollingInterval.current = setInterval(fetchData, 10000);
        }
        
        // Clean up on unmount or when currentPage changes
        return () => {
            if (pollingInterval.current) {
                clearInterval(pollingInterval.current);
            }
            if (animationTimeout.current) {
                clearTimeout(animationTimeout.current);
            }
        };
    }, [playerId, currentPage]);

    if (loading && teams.length === 0) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ padding: 2 }}>
            <Box className="TopBar" sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <DirectionsRunIcon />
                <Typography sx={{marginLeft: '15px', fontWeight: 'bold'}} variant='h6'>
                    Race Track Standings
                </Typography>
            </Box>
            
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            
            <Paper elevation={3} sx={{ p: 3 }}>
                {teams.map((team) => (
                    <Box key={team.id} sx={{ mb: 2 }}>
                        <Typography 
                            variant="subtitle1" 
                            sx={{ 
                                fontWeight: playerTeam?.id === team.id ? 'bold' : 'normal',
                                color: playerTeam?.id === team.id ? 'primary.main' : 'inherit'
                            }}
                        >
                            {team.name} {playerTeam?.id === team.id && '(You)'}
                        </Typography>
                        <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            height: 30, 
                            width: '100%', 
                            bgcolor: 'grey.300',
                            borderRadius: 1,
                            overflow: 'hidden'
                        }}>
                            <Box sx={{ 
                                width: `${(team.distance / 12) * 100}%`, 
                                height: '100%', 
                                bgcolor: playerTeam?.id === team.id ? 'primary.dark' : 'primary.main',
                                borderRadius: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'flex-end',
                                pr: 1,
                                transition: animating ? 'width 1s ease-in-out' : 'none'
                            }}>
                                <Typography variant="body2" color="white">
                                    {team.distance}/12
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                ))}
                <Typography variant="caption" display="block" sx={{ mt: 2 }}>
                    First team to reach 12 points wins the tournament!
                </Typography>
            </Paper>
        </Box>
    );
};

export default TrackPage;
