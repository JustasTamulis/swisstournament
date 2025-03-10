import React, { useState, useEffect, useRef } from 'react';
import { 
    Box, Typography, Paper, Button, Grid, CircularProgress, Alert,
    Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions
} from '@mui/material';
import RedeemIcon from '@mui/icons-material/Redeem';
import { useSearchParams } from 'react-router-dom';
import { 
    getTeamByIdentifier, getBonusForTeam, useBonus 
} from '../../services/tournamentService';
import { useTournament } from '../../context/TournamentContext';

const BonusPage = () => {
    const [searchParams] = useSearchParams();
    const [playerTeam, setPlayerTeam] = useState(null);
    const [bonus, setBonus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const pollingInterval = useRef(null);
    
    // Dialog state
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedBonus, setSelectedBonus] = useState(null);
    
    // Get tournament context
    const { roundInfo, currentPage } = useTournament();
    
    // Get the player_id from URL params
    const playerId = searchParams.get('player_id');

    // Fetch necessary data on component mount
    useEffect(() => {
        const fetchData = async () => {
            if (!playerId) {
                setError('Player ID is required. Please add player_id to the URL.');
                setLoading(false);
                return;
            }
            
            if (!roundInfo) {
                // Wait for roundInfo to be loaded from context
                return;
            }
            
            try {
                setLoading(true);
                setError('');
                
                // Get player team info
                const playerTeamData = await getTeamByIdentifier(playerId);
                setPlayerTeam(playerTeamData);
                
                // Check if player has an available bonus
                if (playerTeamData) {
                    const bonusData = await getBonusForTeam(playerTeamData.id, roundInfo.round_id);
                    setBonus(bonusData);
                }
            } catch (err) {
                console.error("Error fetching bonus data:", err);
                setError('Failed to load bonus data. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        
        // Initial fetch when roundInfo is available
        if (roundInfo) {
            fetchData();
        }
        
        // Only set up polling if this is the current page
        if (currentPage === 'bonus' && roundInfo) {
            pollingInterval.current = setInterval(fetchData, 10000);
        }
        
        // Clean up on unmount or when currentPage/roundInfo changes
        return () => {
            if (pollingInterval.current) {
                clearInterval(pollingInterval.current);
            }
        };
    }, [playerId, roundInfo, currentPage]);

    const handleBonusSelect = (bonusType) => {
        setSelectedBonus(bonusType);
        setDialogOpen(true);
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
        setSelectedBonus(null);
    };

    const handleBonusConfirm = async () => {
        if (!playerTeam || !selectedBonus || !roundInfo) {
            setError('Missing required information to use bonus');
            handleDialogClose();
            return;
        }
        
        try {
            setLoading(true);
            await useBonus(playerTeam.id, selectedBonus, roundInfo.round_id);
            
            // Update bonus status
            const bonusData = await getBonusForTeam(playerTeam.id, roundInfo.round_id);
            setBonus(bonusData);
            
            handleDialogClose();
        } catch (err) {
            console.error("Error using bonus:", err);
            setError('Failed to use bonus. Please try again.');
            handleDialogClose();
        } finally {
            setLoading(false);
        }
    };

    // Check if the bonus is available (round stage is 'bonus' and bonus is not finished)
    const isBonusAvailable = () => {
        return roundInfo?.stage === 'bonus' && bonus && !bonus.finished;
    };

    if (loading && !roundInfo) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ padding: 2 }}>
            <Box className="TopBar" sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <RedeemIcon />
                <Typography sx={{marginLeft: '15px', fontWeight: 'bold'}} variant='h6'>
                    Bonus Selection
                </Typography>
            </Box>
            
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            
            {isBonusAvailable() ? (
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
            ) : bonus && bonus.finished ? (
                <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h6" gutterBottom>
                        You have already used your bonus for this round
                    </Typography>
                    <Typography variant="body1">
                        {bonus.description}
                    </Typography>
                </Paper>
            ) : roundInfo?.stage !== 'bonus' ? (
                <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h6" gutterBottom>
                        Bonus stage is not active
                    </Typography>
                    <Typography variant="body1">
                        The current stage is: {roundInfo?.stage || 'unknown'}
                    </Typography>
                </Paper>
            ) : (
                <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h6">
                        No bonus available at this time
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 2 }}>
                        Bonuses are awarded at specific stages of the tournament
                    </Typography>
                </Paper>
            )}
            
            {/* Bonus confirmation dialog */}
            <Dialog
                open={dialogOpen}
                onClose={handleDialogClose}
            >
                <DialogTitle>Confirm Bonus Selection</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to use the {getReadableBonusName(selectedBonus)} bonus? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleBonusConfirm} color="primary" autoFocus>
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

// Helper function to convert bonus types to readable names
function getReadableBonusName(bonusType) {
    switch (bonusType) {
        case 'move_ahead':
            return 'Move 2 Spaces Ahead';
        case 'extra_bet':
            return 'Get Extra Bet';
        case 'opponent_back':
            return 'Move Opponent Back';
        case 'double_win':
            return 'Double Next Win Points';
        default:
            return bonusType;
    }
}

export default BonusPage;
