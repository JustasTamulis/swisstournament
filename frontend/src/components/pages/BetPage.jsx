import React, { useState, useEffect, useRef } from 'react';
import { 
    Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
    TableHead, TableRow, Button, Dialog, DialogTitle, DialogContent, 
    DialogContentText, DialogActions, CircularProgress, Alert, Tooltip
} from '@mui/material';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import { useSearchParams } from 'react-router-dom';
import { 
    getTeamByIdentifier, getAllTeams, getOddsForRound, 
    getPlayerBets, placeBet, getBetsAvailable 
} from '../../services/tournamentService';
import { useTournament } from '../../context/TournamentContext';

const BetPage = () => {
    const [searchParams] = useSearchParams();
    const [teams, setTeams] = useState([]);
    const [playerTeam, setPlayerTeam] = useState(null);
    const [playerBets, setPlayerBets] = useState([]);
    const [betsAvailable, setBetsAvailable] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [odds, setOdds] = useState([]);
    const pollingInterval = useRef(null);
    
    // Dialog state
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState(null);
    
    // Get tournament context
    const { roundInfo, currentPage } = useTournament();
    
    // Get the player_id from URL params
    const playerId = searchParams.get('player_id');

    // Fetch necessary data on component mount or when roundInfo changes
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
                
                // Get bets available
                const betsData = await getBetsAvailable(playerId);
                setBetsAvailable(betsData.bets_available);
                
                // Get all teams
                const teamsData = await getAllTeams();
                // Sort teams by distance (descending)
                const sortedTeams = teamsData.sort((a, b) => b.distance - a.distance);
                setTeams(sortedTeams);
                
                // Get odds for current round
                const oddsData = await getOddsForRound(roundInfo.round_id);
                setOdds(oddsData);
                
                // Get player's existing bets
                if (playerTeamData) {
                    const playerBetsData = await getPlayerBets(playerTeamData.id, roundInfo.round_id);
                    setPlayerBets(playerBetsData);
                }
            } catch (err) {
                console.error("Error fetching betting data:", err);
                setError('Failed to load betting data. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        
        // Initial fetch when roundInfo is available
        if (roundInfo) {
            fetchData();
        }
        
        // Only set up polling if this is the current page
        if (currentPage === 'bet' && roundInfo) {
            pollingInterval.current = setInterval(fetchData, 10000);
        }
        
        // Clean up on unmount or when currentPage/roundInfo changes
        return () => {
            if (pollingInterval.current) {
                clearInterval(pollingInterval.current);
            }
        };
    }, [playerId, roundInfo, currentPage]);

    const handleBetClick = (team) => {
        setSelectedTeam(team);
        setDialogOpen(true);
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
        setSelectedTeam(null);
    };

    const handleBetConfirm = async () => {
        if (!playerTeam || !selectedTeam || !roundInfo) {
            setError('Missing required information to place bet');
            handleDialogClose();
            return;
        }
        
        try {
            setLoading(true);
            await placeBet(playerTeam.id, selectedTeam.id, roundInfo.round_id);
            
            // Update bets available
            const betsData = await getBetsAvailable(playerId);
            setBetsAvailable(betsData.bets_available);
            
            // Update player's bets
            const playerBetsData = await getPlayerBets(playerTeam.id, roundInfo.round_id);
            setPlayerBets(playerBetsData);
            
            handleDialogClose();
        } catch (err) {
            console.error("Error placing bet:", err);
            setError('Failed to place bet. Please try again.');
            handleDialogClose();
        } finally {
            setLoading(false);
        }
    };

    // Helper function to get odds for a team
    const getOddsForTeam = (teamId) => {
        const teamOdds = odds.find(o => o.team === teamId);
        if (teamOdds) {
            return { odd1: teamOdds.odd1, odd2: teamOdds.odd2 };
        }
        return { odd1: 1.0, odd2: 1.0 };
    };

    // Helper function to get total bets placed on a team
    const getTotalBetsOnTeam = (teamId) => {
        return playerBets.filter(bet => bet.bet_on_team === teamId).length;
    };

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
                <MonetizationOnIcon />
                <Typography sx={{marginLeft: '15px', fontWeight: 'bold'}} variant='h6'>
                    Current Odds & Bets
                </Typography>
            </Box>
            
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            
            {playerTeam && (
                <Alert severity="info" sx={{ mb: 2 }}>
                    You have {betsAvailable} bets available
                </Alert>
            )}
            
            <Paper elevation={3}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Team</TableCell>
                                <TableCell>Distance</TableCell>
                                <TableCell align="right">Odds</TableCell>
                                <TableCell align="right">Your Bets</TableCell>
                                {roundInfo?.stage === 'betting' && betsAvailable > 0 && (
                                    <TableCell align="center">Action</TableCell>
                                )}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {teams.map((team) => {
                                const teamOdds = getOddsForTeam(team.id);
                                const betCount = getTotalBetsOnTeam(team.id);
                                
                                return (
                                    <TableRow key={team.id} sx={{
                                        bgcolor: team.id === playerTeam?.id ? 'rgba(63, 81, 181, 0.08)' : 'inherit'
                                    }}>
                                        <TableCell component="th" scope="row">
                                            <Typography fontWeight={team.id === playerTeam?.id ? 'bold' : 'normal'}>
                                                {team.name} {team.id === playerTeam?.id && '(You)'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>{team.distance}/12</TableCell>
                                        <TableCell align="right">{teamOdds.odd1}/{teamOdds.odd2}</TableCell>
                                        <TableCell align="right">{betCount}</TableCell>
                                        {roundInfo?.stage === 'betting' && betsAvailable > 0 && (
                                            <TableCell align="center">
                                                <Button 
                                                    variant="contained" 
                                                    size="small" 
                                                    color="primary"
                                                    onClick={() => handleBetClick(team)}
                                                    disabled={team.id === playerTeam?.id} // Can't bet on yourself
                                                >
                                                    Bet
                                                </Button>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
            
            {/* Bet confirmation dialog */}
            <Dialog
                open={dialogOpen}
                onClose={handleDialogClose}
            >
                <DialogTitle>Confirm Bet</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to place a bet on {selectedTeam?.name}?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleBetConfirm} color="primary" autoFocus>
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default BetPage;
