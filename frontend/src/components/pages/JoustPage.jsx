import React, { useState, useEffect, useRef } from 'react';
import { 
    Box, Typography, Paper, CircularProgress, Alert, Button, 
    Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
    Chip, Divider
} from '@mui/material';
import SportsKabaddiIcon from '@mui/icons-material/SportsKabaddi';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LocationOnIcon from '@mui/icons-material/LocationOn';
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
    const [location, setLocation] = useState('');
    const [lastGameResult, setLastGameResult] = useState(null);
    const [gameWinner, setGameWinner] = useState(null);
    
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
                            setGameId(opponentData.game_id);
                            setLocation(opponentData.location || '');
                            
                            // Store game result information if the game is finished
                            if (opponentData.game_finished) {
                                // Determine the winner based on the game data
                                const games = await getGamesForRound(roundId);
                                const thisGame = games.find(g => g.id === opponentData.game_id);
                                if (thisGame) {
                                    const winnerTeam = thisGame.win ? 
                                        { id: thisGame.team1, name: playerTeamData.id === thisGame.team1 ? playerTeamData.name : opponentData.opponent_name } :
                                        { id: thisGame.team2, name: playerTeamData.id === thisGame.team2 ? playerTeamData.name : opponentData.opponent_name };
                                    
                                    setGameWinner(winnerTeam);
                                    setLastGameResult({
                                        player: playerTeamData.name,
                                        opponent: opponentData.opponent_name,
                                        location: opponentData.location,
                                        winner: winnerTeam.name
                                    });
                                }
                            }
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
                    setLocation('');
                    
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
            
            // Store the result for display after completion
            const winner = selectedWinner === playerTeam.id ? playerTeam.name : opponent;
            setLastGameResult({
                player: playerTeam.name,
                opponent: opponent,
                location: location,
                winner: winner
            });
            
            // Set game as finished and store winner
            setGameFinished(true);
            setGameWinner({ id: selectedWinner, name: winner });
            
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
                <Paper elevation={3} sx={{ p: 3 }}>
                    {roundStage === 'final' && (
                        <Alert severity="warning" sx={{ mb: 3 }}>
                            This is a tiebreaker match! The winner will determine final tournament placement.
                        </Alert>
                    )}
                    
                    {/* VS match display with staggered team names */}
                    <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        mt: 2,
                        mb: 4,
                        position: 'relative',
                        maxWidth: '600px',
                        width: '100%',
                        mx: 'auto'
                    }}>
                        {/* Player's team */}
                        <Box sx={{ 
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'flex-start',
                            mb: 1
                        }}>
                            <Box sx={{ 
                                bgcolor: 'rgba(63, 81, 181, 0.1)',
                                px: 2,
                                py: 1,
                                borderRadius: '4px',
                                maxWidth: '60%'
                            }}>
                                <Typography variant="h5" fontWeight="bold" color="primary">
                                    {playerTeam?.name}
                                </Typography>
                            </Box>
                        </Box>
                        
                        {/* VS indicator */}
                        <Box sx={{ 
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            bgcolor: 'background.paper',
                            borderRadius: '50%',
                            width: 40,
                            height: 40,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: 1,
                            zIndex: 2,
                            border: '1px solid',
                            borderColor: 'divider'
                        }}>
                            <Typography variant="body1" fontWeight="bold">VS</Typography>
                        </Box>
                        
                        {/* Opponent's team */}
                        <Box sx={{ 
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'flex-end',
                            mt: 1
                        }}>
                            <Box sx={{ 
                                bgcolor: 'rgba(244, 67, 54, 0.1)',
                                px: 2,
                                py: 1,
                                borderRadius: '4px',
                                maxWidth: '60%'
                            }}>
                                <Typography variant="h5" fontWeight="bold" color="error">
                                    {opponent}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                    
                    {/* Location display */}
                    <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        mb: 3 
                    }}>
                        <LocationOnIcon color="secondary" sx={{ mr: 1 }} />
                        <Typography variant="body1" color="secondary" fontWeight="medium">
                            Location: {location}
                        </Typography>
                    </Box>
                    
                    {opponentDescription && (
                        <Typography variant="body2" sx={{ my: 2, fontStyle: 'italic', textAlign: 'center' }}>
                            "{opponentDescription}"
                        </Typography>
                    )}
                    
                    <Divider sx={{ my: 2 }} />
                    
                    {gameFinished ? (
                        <Box sx={{ mt: 3, textAlign: 'center' }}>
                            <Alert severity="info" sx={{ display: 'inline-block' }}>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="h6" gutterBottom>
                                        Match Completed
                                    </Typography>
                                    <Typography>
                                        Winner: <strong>{gameWinner?.name}</strong>
                                    </Typography>
                                    <Typography variant="body2" sx={{ mt: 1 }}>
                                        This game has been recorded. The winner has advanced on the track.
                                    </Typography>
                                </Box>
                            </Alert>
                        </Box>
                    ) : (
                        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
                            <Button 
                                variant="contained" 
                                color="success"
                                onClick={handleWinClick}
                                disabled={loading}
                                sx={{ px: 4, py: 1 }}
                            >
                                I Won
                            </Button>
                            <Button 
                                variant="contained" 
                                color="error"
                                onClick={handleLoseClick}
                                disabled={loading}
                                sx={{ px: 4, py: 1 }}
                            >
                                I Lost
                            </Button>
                        </Box>
                    )}
                </Paper>
            ) : lastGameResult ? (
                <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h6" gutterBottom>
                        Last Match Result
                    </Typography>
                    
                    {/* Last match result display */}
                    <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        mt: 2,
                        mb: 2,
                        position: 'relative'
                    }}>
                        {/* Player's team */}
                        <Box sx={{ 
                            alignSelf: 'flex-start', 
                            mb: 1,
                            bgcolor: 'rgba(63, 81, 181, 0.1)',
                            px: 2,
                            py: 1,
                            borderRadius: '4px'
                        }}>
                            <Typography variant="h6" color="primary">
                                {lastGameResult.player}
                            </Typography>
                        </Box>
                        
                        {/* VS indicator */}
                        <Box sx={{ 
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            bgcolor: 'background.paper',
                            borderRadius: '50%',
                            width: 30,
                            height: 30,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: 1,
                            zIndex: 2,
                            border: '1px solid',
                            borderColor: 'divider'
                        }}>
                            <Typography variant="body2" fontWeight="bold">VS</Typography>
                        </Box>
                        
                        {/* Opponent's team */}
                        <Box sx={{ 
                            alignSelf: 'flex-end', 
                            mt: 1,
                            bgcolor: 'rgba(244, 67, 54, 0.1)',
                            px: 2,
                            py: 1,
                            borderRadius: '4px'
                        }}>
                            <Typography variant="h6" color="error">
                                {lastGameResult.opponent}
                            </Typography>
                        </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
                        <LocationOnIcon fontSize="small" sx={{ mr: 0.5 }} />
                        <Typography variant="body2" color="text.secondary">
                            {lastGameResult.location}
                        </Typography>
                    </Box>
                    
                    <Chip 
                        label={`Winner: ${lastGameResult.winner}`}
                        color="success"
                        variant="outlined"
                        sx={{ mt: 1 }}
                    />
                    
                    <Typography variant="body2" sx={{ mt: 3 }}>
                        No more matches scheduled for this round.
                    </Typography>
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
