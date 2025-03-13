import React, { useState, useEffect, useRef } from 'react';
import { 
    Box, Typography, Paper, CircularProgress, Alert, Button, 
    Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions
} from '@mui/material';
import SportsKabaddiIcon from '@mui/icons-material/SportsKabaddi';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
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
    const [opponentDescription, setOpponentDescription] = useState('');
    const [gameId, setGameId] = useState(null);
    const [gameFinished, setGameFinished] = useState(false);
    const [playerTeam, setPlayerTeam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Dialog state
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedWinner, setSelectedWinner] = useState(null);
    
    // Get tournament context
    const { roundInfo, roundChanged } = useTournament();
    
    // Extract only the properties we need to depend on
    const roundId = roundInfo?.round_id;
    const roundStage = roundInfo?.stage;
    
    // Get the player_id from URL params
    const playerId = searchParams.get('player_id');

    useEffect(() => {
        const fetchData = async () => {
            if (!playerId || !roundId) {
                if (!playerId) {
                    setError('Player ID is required. Please add player_id to the URL.');
                }
                setLoading(false);
                return;
            }
            
            try {
                setLoading(true);
                setError('');
                
                // Only continue if we're in joust or final stage
                if (roundStage === 'joust' || roundStage === 'final') {
                    // Get player team info
                    const playerTeamData = await getTeamByIdentifier(playerId);
                    setPlayerTeam(playerTeamData);
                    
                    if (playerTeamData) {
                        // Get next opponent
                        try {
                            const opponentData = await getNextOpponent(playerId, roundId);
                            setOpponent(opponentData.opponent_name);
                            setOpponentId(opponentData.opponent_id);
                            setOpponentDescription(opponentData.opponent_description || '');
                            setGameFinished(opponentData.game_finished || false);
                            setGameId(opponentData.game_id); // Use the game ID from the API response
                        } catch (opponentError) {
                            // If there's an error getting opponent, it might mean all games are finished
                            console.log("No opponent found, might be finished:", opponentError);
                        }
                    }
                } else {
                    // Not in joust or final stage - clear opponent data
                    setOpponent(null);
                    setOpponentId(null);
                    setOpponentDescription('');
                    setGameFinished(false);
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
        
        fetchData();
        
    }, [playerId, roundId, roundStage, roundChanged]);

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
                {roundStage === 'final' ? <EmojiEventsIcon /> : <SportsKabaddiIcon />}
                <Typography sx={{marginLeft: '15px', fontWeight: 'bold'}} variant='h6'>
                    {roundStage === 'final' ? 'Final Tiebreaker Match' : 'Your Next Match'}
                </Typography>
            </Box>
            
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            
            {roundStage !== 'joust' && roundStage !== 'final' ? (
                <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h6" gutterBottom>
                        {roundStage === 'finished' ? 
                            'Tournament has ended' : 
                            'Match stage is not active'
                        }
                    </Typography>
                    <Typography variant="body1">
                        The current stage is: {roundInfo?.stage || 'unknown'}
                    </Typography>
                </Paper>
            ) : opponent ? (
                <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
                    {roundStage === 'final' && (
                        <Alert severity="warning" sx={{ mb: 3 }}>
                            This is a tiebreaker match! The winner will determine final tournament placement.
                        </Alert>
                    )}
                    
                    <Typography variant="h5" gutterBottom>
                        Your {roundStage === 'final' ? 'tiebreaker' : 'next'} opponent is:
                    </Typography>
                    <Typography variant="h4" color="primary" gutterBottom>
                        {opponent}
                    </Typography>
                    
                    {opponentDescription && (
                        <Typography variant="body1" sx={{ mt: 2, mb: 2, fontStyle: 'italic' }}>
                            "{opponentDescription}"
                        </Typography>
                    )}
                    
                    {gameFinished ? (
                        <Box sx={{ mt: 3 }}>
                            <Alert severity="info">
                                This game has already been completed. Please wait for the results.
                            </Alert>
                        </Box>
                    ) : (
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
                    )}
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
                <DialogTitle>
                    {roundStage === 'final' ? 'Confirm Tiebreaker Result' : 'Confirm Result'}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to record this result? This action cannot be undone.
                        {roundStage === 'final' && ' This is a final tiebreaker match that will determine tournament placement.'}
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
