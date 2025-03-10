import React, { useState, useEffect, useRef } from 'react';
import { 
    Box, Typography, Paper, CircularProgress, Alert, Button, 
    Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions
} from '@mui/material';
import SportsKabaddiIcon from '@mui/icons-material/SportsKabaddi';
import { useSearchParams } from 'react-router-dom';
import { 
    getTeamByIdentifier, getNextOpponent,
    getGamesForRound, markGame
} from '../../services/tournamentService';
import { useTournament } from '../../context/TournamentContext';

const JoustPage = () => {
    const [searchParams] = useSearchParams();
    const [opponent, setOpponent] = useState(null);
    const [opponentId, setOpponentId] = useState(null);
    const [gameId, setGameId] = useState(null);
    const [playerTeam, setPlayerTeam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const pollingInterval = useRef(null);
    
    // Dialog state
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedWinner, setSelectedWinner] = useState(null);
    
    // Get tournament context
    const { roundInfo, currentPage } = useTournament();
    
    // Get the player_id from URL params
    const playerId = searchParams.get('player_id');

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
                
                // Only continue if we're in joust stage
                if (roundInfo.stage === 'joust') {
                    // Get player team info
                    const playerTeamData = await getTeamByIdentifier(playerId);
                    setPlayerTeam(playerTeamData);
                    
                    if (playerTeamData) {
                        // Get next opponent
                        try {
                            const opponentData = await getNextOpponent(playerId, roundInfo.round_id);
                            setOpponent(opponentData.opponent_name);
                            setOpponentId(opponentData.opponent_id);
                            
                            // Find the game
                            const games = await getGamesForRound(roundInfo.round_id);
                            const relevantGame = games.find(game => 
                                (game.team1 === playerTeamData.id && game.team2 === opponentData.opponent_id) || 
                                (game.team2 === playerTeamData.id && game.team1 === opponentData.opponent_id)
                            );
                            
                            if (relevantGame) {
                                setGameId(relevantGame.id);
                            }
                        } catch (opponentError) {
                            // If there's an error getting opponent, it might mean all games are finished
                            console.log("No opponent found, might be finished:", opponentError);
                        }
                    }
                } else {
                    // Not in joust stage - clear opponent data
                    setOpponent(null);
                    setOpponentId(null);
                    setGameId(null);
                    
                    // Get player team info for display purposes
                    const playerTeamData = await getTeamByIdentifier(playerId);
                    setPlayerTeam(playerTeamData);
                }
            } catch (err) {
                console.error("Error fetching joust data:", err);
                setError('Failed to load joust data. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        
        // Initial fetch when roundInfo is available
        if (roundInfo) {
            fetchData();
        }
        
        // Only set up polling if this is the current page
        if (currentPage === 'joust' && roundInfo) {
            pollingInterval.current = setInterval(fetchData, 10000);
        }
        
        // Clean up on unmount or when currentPage/roundInfo changes
        return () => {
            if (pollingInterval.current) {
                clearInterval(pollingInterval.current);
            }
        };
    }, [playerId, roundInfo, currentPage]);

    const handleWinClick = () => {
        setSelectedWinner(playerTeam.id);
        setDialogOpen(true);
    };

    const handleLoseClick = () => {
        setSelectedWinner(opponentId);
        setDialogOpen(true);
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
        setSelectedWinner(null);
    };

    const handleResultConfirm = async () => {
        if (!playerTeam || !gameId || !selectedWinner || !roundInfo) {
            setError('Missing required information to record result');
            handleDialogClose();
            return;
        }
        
        try {
            setLoading(true);
            await markGame(playerTeam.id, gameId, selectedWinner, roundInfo.round_id);
            
            // Clear opponent info after marking the game
            setOpponent(null);
            setOpponentId(null);
            setGameId(null);
            
            handleDialogClose();
        } catch (err) {
            console.error("Error marking game:", err);
            setError('Failed to record game result. Please try again.');
            handleDialogClose();
        } finally {
            setLoading(false);
        }
    };

    if (loading && !opponent && !roundInfo) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ padding: 2 }}>
            <Box className="TopBar" sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <SportsKabaddiIcon />
                <Typography sx={{marginLeft: '15px', fontWeight: 'bold'}} variant='h6'>
                    Your Next Match
                </Typography>
            </Box>
            
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            
            {roundInfo?.stage !== 'joust' ? (
                <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h6" gutterBottom>
                        Joust stage is not active
                    </Typography>
                    <Typography variant="body1">
                        The current stage is: {roundInfo?.stage || 'unknown'}
                    </Typography>
                </Paper>
            ) : opponent ? (
                <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h5" gutterBottom>
                        Your next opponent is:
                    </Typography>
                    <Typography variant="h4" color="primary" gutterBottom>
                        {opponent}
                    </Typography>
                    
                    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
                        <Button 
                            variant="contained" 
                            color="success"
                            onClick={handleWinClick}
                            disabled={loading}
                        >
                            I Won
                        </Button>
                        <Button 
                            variant="contained" 
                            color="error"
                            onClick={handleLoseClick}
                            disabled={loading}
                        >
                            I Lost
                        </Button>
                    </Box>
                </Paper>
            ) : (
                <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h6" gutterBottom>
                        No upcoming matches found
                    </Typography>
                    <Typography variant="body1">
                        You have either completed all your matches for this round or there are no matches scheduled.
                    </Typography>
                </Paper>
            )}
            
            {/* Result confirmation dialog */}
            <Dialog
                open={dialogOpen}
                onClose={handleDialogClose}
            >
                <DialogTitle>Confirm Result</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to record this result? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleResultConfirm} color="primary" autoFocus>
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default JoustPage;
