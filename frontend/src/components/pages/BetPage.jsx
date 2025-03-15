import React, { useState, useEffect, useRef } from 'react';
import { 
    Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
    TableHead, TableRow, Button, Dialog, DialogTitle, DialogContent, 
    DialogContentText, DialogActions, CircularProgress, Alert,
    Divider
} from '@mui/material';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LooksOneIcon from '@mui/icons-material/LooksOne';
import LooksTwoIcon from '@mui/icons-material/LooksTwo';
import { useSearchParams } from 'react-router-dom';
import { 
    placeBet, getBettingTable, getTournamentResults
} from '../../services/tournamentService';
import { useTournament } from '../../context/TournamentContext';

const BetPage = () => {
    const [searchParams] = useSearchParams();
    const [tableData, setTableData] = useState({
        teams: [],
        bets_available: 0,
        round_stage: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [previousOdds, setPreviousOdds] = useState({});
    
    // Dialog state
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [tournamentResults, setTournamentResults] = useState(null);
    
    // Get tournament context
    const { roundInfo, roundChanged, refreshRoundInfo, finishDistance } = useTournament();
    
    // Get the player_id from URL params
    const playerId = searchParams.get('player_id');

    // Extract only the properties we need to depend on
    const roundId = roundInfo?.round_id;
    const roundStage = roundInfo?.stage;

    // Fetch betting table data only on mount or round/stage change
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
                
                // Get all betting table data in a single API call
                const data = await getBettingTable(playerId, roundId);
                
                // If teams have odds, store them for future reference
                if (data.teams && data.teams.some(team => team.odd1 && team.odd2)) {
                    const newOdds = {};
                    data.teams.forEach(team => {
                        newOdds[team.id] = { odd1: team.odd1, odd2: team.odd2 };
                    });
                    setPreviousOdds(newOdds);
                } 
                // Otherwise, use previous odds if available
                else if (Object.keys(previousOdds).length > 0) {
                    // Copy the teams but restore the odds from previous odds
                    const teamsWithOdds = data.teams.map(team => {
                        if (previousOdds[team.id]) {
                            return {
                                ...team,
                                odd1: previousOdds[team.id].odd1,
                                odd2: previousOdds[team.id].odd2
                            };
                        }
                        return team;
                    });
                    
                    data.teams = teamsWithOdds;
                }
                
                setTableData(data);
            } catch (err) {
                console.error("Error fetching betting data:", err);
                setError('Failed to load betting data. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
        
    }, [playerId, roundId, roundStage, roundChanged]);

    // Fetch tournament results if in finished stage
    useEffect(() => {
        const fetchTournamentResults = async () => {
            if (roundStage === 'finished') {
                try {
                    const results = await getTournamentResults();
                    if (results && results.active) {
                        setTournamentResults(results);
                    }
                } catch (err) {
                    console.error("Error fetching tournament results:", err);
                }
            }
        };
        
        fetchTournamentResults();
    }, [roundStage]);

    const handleBetClick = (team) => {
        setSelectedTeam(team);
        setDialogOpen(true);
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
        setSelectedTeam(null);
    };

    const handleBetConfirm = async () => {
        if (!selectedTeam || !roundInfo) {
            setError('Missing required information to place bet');
            handleDialogClose();
            return;
        }
        
        try {
            setLoading(true);
            // Get the player team ID from the table data
            const playerTeam = tableData.teams.find(team => team.is_player_team);
            
            if (!playerTeam) {
                throw new Error('Could not identify player team');
            }
            
            await placeBet(playerTeam.id, selectedTeam.id, roundInfo.round_id);
            
            // Refresh the betting table data
            const data = await getBettingTable(playerId, roundInfo.round_id);
            
            // Preserve odds when refreshing after a bet
            if (Object.keys(previousOdds).length > 0) {
                const teamsWithOdds = data.teams.map(team => {
                    if (previousOdds[team.id]) {
                        return {
                            ...team,
                            odd1: previousOdds[team.id].odd1,
                            odd2: previousOdds[team.id].odd2
                        };
                    }
                    return team;
                });
                
                data.teams = teamsWithOdds;
            }
            
            setTableData(data);
            
            handleDialogClose();
        } catch (err) {
            console.error("Error placing bet:", err);
            setError('Failed to place bet. Please try again.');
            handleDialogClose();
        } finally {
            setLoading(false);
        }
    };

    if (loading && tableData.teams.length === 0) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ padding: 0 }}>
            <Box className="TopBar" sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <MonetizationOnIcon />
                <Typography sx={{marginLeft: '15px', fontWeight: 'bold'}} variant='h6'>
                    {roundStage === 'finished' ? 'Tournament Results' : 'Current Odds & Bets'}
                </Typography>
            </Box>
            
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            
            {/* Show different content based on tournament stage */}
            {roundStage === 'finished' && tournamentResults ? (
                <Box>
                    {/* Display Race Winners */}
                    <Paper elevation={3} sx={{ p: 3, mb: 3, textAlign: 'center' }}>
                        <Typography variant="h5" gutterBottom>
                            Race Winners
                        </Typography>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, mt: 3 }}>
                            {/* First Place */}
                            <Box sx={{ textAlign: 'center' }}>
                                <Box sx={{ 
                                    display: 'flex', 
                                    justifyContent: 'center', 
                                    alignItems: 'center', 
                                    mb: 1,
                                    width: '60px',
                                    height: '60px',
                                    borderRadius: '50%',
                                    backgroundColor: 'rgba(255, 215, 0, 0.2)',
                                    border: '2px solid gold',
                                    mx: 'auto'
                                }}>
                                    <LooksOneIcon sx={{ fontSize: '2rem', color: 'gold' }} />
                                </Box>
                                <Typography variant="h6">{tournamentResults.first_place.name}</Typography>
                                <Typography variant="body2" color="text.secondary">First Place</Typography>
                            </Box>
                            
                            {/* Second Place */}
                            <Box sx={{ textAlign: 'center' }}>
                                <Box sx={{ 
                                    display: 'flex', 
                                    justifyContent: 'center', 
                                    alignItems: 'center', 
                                    mb: 1,
                                    width: '60px',
                                    height: '60px',
                                    borderRadius: '50%',
                                    backgroundColor: 'rgba(192, 192, 192, 0.2)',
                                    border: '2px solid silver',
                                    mx: 'auto'
                                }}>
                                    <LooksTwoIcon sx={{ fontSize: '2rem', color: 'silver' }} />
                                </Box>
                                <Typography variant="h6">
                                    {tournamentResults.second_place ? 
                                        tournamentResults.second_place.name : 
                                        "Not determined"}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">Second Place</Typography>
                            </Box>
                        </Box>
                    </Paper>
                    
                    {/* Add "The Oracles" section */}
                    <Paper elevation={3} sx={{ p: 3, mb: 3, textAlign: 'center' }}>
                        <Typography variant="h5" gutterBottom>
                            The Oracles
                        </Typography>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, mt: 3 }}>
                            {/* Betting Winner */}
                            <Box sx={{ textAlign: 'center' }}>
                                <Box sx={{ 
                                    display: 'flex', 
                                    justifyContent: 'center', 
                                    alignItems: 'center', 
                                    mb: 1,
                                    width: '60px',
                                    height: '60px',
                                    borderRadius: '50%',
                                    backgroundColor: 'rgba(75, 0, 130, 0.2)',
                                    border: '2px solid purple',
                                    mx: 'auto'
                                }}>
                                    <EmojiEventsIcon sx={{ fontSize: '2rem', color: 'purple' }} />
                                </Box>
                                <Typography variant="h6">
                                    {tournamentResults.betting_results.length > 0 ? 
                                        tournamentResults.betting_results[0].team.name : 
                                        "Not determined"}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {tournamentResults.betting_results.length > 0 ? 
                                        `${tournamentResults.betting_results[0].total_points.toFixed(2)} points` : 
                                        ""}
                                </Typography>
                            </Box>
                        </Box>
                    </Paper>
                    
                    {/* Display Betting Results */}
                    <Paper elevation={3} sx={{ mt: 4, width: '100%', overflow: 'auto' }}>
                        <TableContainer sx={{ width: '100%' }}>
                            <Table size="small" sx={{ minWidth: '100%' }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Rank</TableCell>
                                        <TableCell>Team</TableCell>
                                        <TableCell align="center">1st Points</TableCell>
                                        <TableCell align="center">2nd Points</TableCell>
                                        <TableCell align="center">Total</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {tournamentResults.betting_results.map((result, index) => {
                                        const isPlayerTeam = playerId && result.team.identifier === playerId;
                                        
                                        return (
                                            <TableRow key={result.team.id} sx={{
                                                bgcolor: isPlayerTeam ? 'rgba(63, 81, 181, 0.08)' : 'inherit'
                                            }}>
                                                <TableCell>{index + 1}</TableCell>
                                                <TableCell>
                                                    <Typography fontWeight={isPlayerTeam ? 'bold' : 'normal'} variant="body2">
                                                        {result.team.name} {isPlayerTeam && '(You)'}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="center">
                                                    {result.first_place_points.toFixed(2)}
                                                </TableCell>
                                                <TableCell align="center">
                                                    {result.second_place_points.toFixed(2)}
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Box sx={{ fontWeight: 'bold' }}>
                                                        {result.total_points.toFixed(2)}
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        
                        <Box sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                                Points based on odds received when betting on the winners.
                            </Typography>
                        </Box>
                    </Paper>
                </Box>
            ) : (
                <>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', textAlign: 'center' }}>
                        Bets available: {tableData.bets_available}
                    </Typography>
                    
                    <Paper elevation={3} sx={{ width: '100%', overflow: 'auto' }}>
                        <TableContainer sx={{ width: '100%' }}>
                            <Table size="small" sx={{ minWidth: '100%', tableLayout: 'fixed' }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ p: 1, fontSize: '0.8rem', width: '35%' }}>Team</TableCell>
                                        <TableCell align="center" sx={{ p: 1, fontSize: '0.8rem', width: '10%' }}>Dist</TableCell>
                                        <TableCell align="center" sx={{ p: 1, fontSize: '0.8rem', width: '20%' }}>Odds</TableCell>
                                        <TableCell align="center" sx={{ p: 1, fontSize: '0.8rem', width: '20%' }}>Bets</TableCell>
                                        <TableCell align="center" sx={{ p: 1, fontSize: '0.8rem', width: '15%' }}>Action</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {tableData.teams.map((team) => (
                                        <TableRow key={team.id} sx={{
                                            bgcolor: team.is_player_team ? 'rgba(63, 81, 181, 0.08)' : 'inherit',
                                            '&:hover': {
                                                backgroundColor: 'rgba(0, 0, 0, 0.04)'
                                            }
                                        }}>
                                            <TableCell 
                                                component="th" 
                                                scope="row" 
                                                sx={{ 
                                                    p: 1,
                                                    cursor: 'pointer',
                                                    position: 'relative'
                                                }} 
                                                title={team.description}
                                                onClick={(e) => {
                                                    const tooltip = document.createElement('div');
                                                    tooltip.innerHTML = team.description;
                                                    tooltip.style.position = 'absolute';
                                                    tooltip.style.backgroundColor = 'white';
                                                    tooltip.style.padding = '8px';
                                                    tooltip.style.borderRadius = '4px';
                                                    tooltip.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
                                                    tooltip.style.zIndex = '1000';
                                                    tooltip.style.maxWidth = '200px';
                                                    tooltip.style.left = `${e.clientX}px`;
                                                    tooltip.style.top = `${e.clientY}px`;
                                                    
                                                    document.body.appendChild(tooltip);
                                                    
                                                    setTimeout(() => {
                                                        document.body.removeChild(tooltip);
                                                    }, 3000);
                                                }}
                                            >
                                                <Typography variant="body2" fontWeight={team.is_player_team ? 'bold' : 'normal'}>
                                                    {team.name} {team.is_player_team && '(You)'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center" sx={{ p: 1, fontSize: '0.75rem' }}>{team.distance}</TableCell>
                                            <TableCell align="center" sx={{ p: 1 }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
                                                    <Box sx={{ fontSize: '0.75rem', mx: 1 }}>{parseInt(team.odd1)}</Box>
                                                    <Box sx={{ fontSize: '0.75rem', mx: 1 }}>{parseInt(team.odd2)}</Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell align="center" sx={{ p: 1 }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
                                                    <Box sx={{ fontSize: '0.75rem', mx: 1 }}>{team.bet1}</Box>
                                                    <Box sx={{ fontSize: '0.75rem', mx: 1 }}>{team.bet2}</Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell align="center" sx={{ p: 1 }}>
                                                {!team.is_player_team && (
                                                    <Button 
                                                        variant="contained" 
                                                        size="small" 
                                                        color="primary"
                                                        onClick={() => handleBetClick(team)}
                                                        disabled={tableData.round_stage !== 'betting' || tableData.bets_available <= 0}
                                                        sx={{ 
                                                            py: 0, 
                                                            px: 1, 
                                                            minWidth: '40px',
                                                            fontSize: '0.75rem'
                                                        }}
                                                    >
                                                        Bet
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </>
            )}
            
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
