import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import { useSearchParams } from 'react-router';

const TrackPage = () => {
    const [searchParams] = useSearchParams();
    const [teams, setTeams] = useState([]);

    // Read query parameters
    useEffect(() => {
        console.log("Query Parameters in Track Page:");
        for (const [key, value] of searchParams.entries()) {
            console.log(`${key}: ${value}`);
        }
        
        // Simulate teams data with distances
        setTeams([
            { id: 1, name: 'Team A', distance: 8 },
            { id: 2, name: 'Team B', distance: 5 },
            { id: 3, name: 'Team C', distance: 3 },
        ]);
    }, [searchParams]);

    return (
        <Box sx={{ padding: 2 }}>
            <Box className="TopBar" sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <DirectionsRunIcon />
                <Typography sx={{marginLeft: '15px', fontWeight: 'bold'}} variant='h6'>
                    Race Track Standings
                </Typography>
            </Box>
            
            <Paper elevation={3} sx={{ p: 3 }}>
                {teams.map((team) => (
                    <Box key={team.id} sx={{ mb: 2 }}>
                        <Typography variant="subtitle1">{team.name}</Typography>
                        <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            height: 30, 
                            width: '100%', 
                            bgcolor: 'grey.300',
                            borderRadius: 1
                        }}>
                            <Box sx={{ 
                                width: `${(team.distance / 12) * 100}%`, 
                                height: '100%', 
                                bgcolor: 'primary.main',
                                borderRadius: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'flex-end',
                                pr: 1
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
