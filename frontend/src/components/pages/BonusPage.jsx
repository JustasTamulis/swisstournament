import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import Grid from '@mui/material/Grid2';
import RedeemIcon from '@mui/icons-material/Redeem';
import { useSearchParams } from 'react-router';

const BonusPage = () => {
    const [searchParams] = useSearchParams();
    const [hasBonusAvailable, setHasBonusAvailable] = useState(false);

    // Read query parameters
    useEffect(() => {
        console.log("Query Parameters in Bonus Page:");
        for (const [key, value] of searchParams.entries()) {
            console.log(`${key}: ${value}`);
        }
        
        // Simulate bonus availability
        setHasBonusAvailable(true);
    }, [searchParams]);

    const handleBonusSelect = (bonusType) => {
        console.log(`Selected bonus: ${bonusType}`);
        // In the actual implementation, we'll submit this to the API
    };

    return (
        <Box sx={{ padding: 2 }}>
            <Box className="TopBar" sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <RedeemIcon />
                <Typography sx={{marginLeft: '15px', fontWeight: 'bold'}} variant='h6'>
                    Bonus Selection
                </Typography>
            </Box>
            
            {hasBonusAvailable ? (
                <Paper elevation={3} sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        You have a bonus available! Choose one:
                    </Typography>
                    
                    <Grid container spacing={2} sx={{ mt: 2 }}>
                        <Grid item xs={12} sm={6}>
                            <Button 
                                variant="outlined" 
                                fullWidth 
                                onClick={() => handleBonusSelect('move_ahead')}
                                sx={{ height: '100px' }}
                            >
                                Move 2 Spaces Ahead
                            </Button>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Button 
                                variant="outlined" 
                                fullWidth 
                                onClick={() => handleBonusSelect('extra_bet')}
                                sx={{ height: '100px' }}
                            >
                                Get Extra Bet
                            </Button>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Button 
                                variant="outlined" 
                                fullWidth 
                                onClick={() => handleBonusSelect('opponent_back')}
                                sx={{ height: '100px' }}
                            >
                                Move Opponent Back
                            </Button>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Button 
                                variant="outlined" 
                                fullWidth 
                                onClick={() => handleBonusSelect('double_win')}
                                sx={{ height: '100px' }}
                            >
                                Double Next Win Points
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>
            ) : (
                <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h6">
                        No bonus available at this time.
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 2 }}>
                        Bonuses are awarded at specific stages of the tournament.
                    </Typography>
                </Paper>
            )}
        </Box>
    );
};

export default BonusPage;
