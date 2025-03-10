import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import SportsKabaddiIcon from '@mui/icons-material/SportsKabaddi';
import { useSearchParams } from 'react-router';

const JoustPage = () => {
    const [searchParams] = useSearchParams();
    const [opponent, setOpponent] = useState(null);

    // Read query parameters
    useEffect(() => {
        // Log query parameters for debugging
        console.log("Query Parameters in Joust Page:");
        for (const [key, value] of searchParams.entries()) {
            console.log(`${key}: ${value}`);
        }
        
        // In the actual implementation, we'll fetch the next opponent
        // For now, just simulate one
        setOpponent("Opponent Team");
    }, [searchParams]);

    return (
        <Box sx={{ padding: 2 }}>
            <Box className="TopBar" sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <SportsKabaddiIcon />
                <Typography sx={{marginLeft: '15px', fontWeight: 'bold'}} variant='h6'>
                    Your Next Match
                </Typography>
            </Box>
            
            <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
                {opponent ? (
                    <>
                        <Typography variant="h5" gutterBottom>
                            Your next opponent is:
                        </Typography>
                        <Typography variant="h4" color="primary">
                            {opponent}
                        </Typography>
                        <Typography variant="body1" sx={{ mt: 2 }}>
                            Prepare for your joust! The match will begin soon.
                        </Typography>
                    </>
                ) : (
                    <Typography variant="body1">
                        No upcoming matches found.
                    </Typography>
                )}
            </Paper>
        </Box>
    );
};

export default JoustPage;
