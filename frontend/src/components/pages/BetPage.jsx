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
    const pollingInterval = useRef(null);
    
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
        <Box sx={{ padding: 2 }}>
            <Box className="TopBar" sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <MonetizationOnIcon />
                <Typography sx={{marginLeft: '15px', fontWeight: 'bold'}} variant='h6'>
                    {roundStage === 'finished' ? 'Tournament Results' : 'Current Odds & Bets'}
                </Typography>
                
                {roundStage === 'finished' && (
                    <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'primary.main', px: 2, py: 0.5, borderRadius: 1 }}>
                        <EmojiEventsIcon sx={{ color: 'white' }} />
                        <Typography variant="body2" sx={{ color: 'white', fontWeight: 'bold' }}>
                            Tournament Completed!
                        </Typography>
                    </Box>
                )}
            </Box>
            
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            
            {/* Show different content based on tournament stage */}
            {roundStage === 'finished' && tournamentResults ? (
                <Box>
                    {/* Display Winners */}
                    <Paper elevation={3} sx={{ p: 3, mb: 3, textAlign: 'center' }}>
                        <Typography variant="h5" gutterBottom>
                            Tournament Winners
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
                    
                    {/* Display Betting Results */}
                    <Paper elevation={3} sx={{ mt: 4 }}>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Rank</TableCell>
                                        <TableCell>Team</TableCell>
                                        <TableCell align="center">First Place Points</TableCell>
                                        <TableCell align="center">Second Place Points</TableCell>
                                        <TableCell align="center">Total Points</TableCell>
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
                                                    <Typography fontWeight={isPlayerTeam ? 'bold' : 'normal'}>
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
                                Points shown are based on the odds you received when betting on the winners.
                            </Typography>
                        </Box>
                    </Paper>
                </Box>
            ) : (
                <>
                    <Alert severity="info" sx={{ mb: 2 }}>
                        You have {tableData.bets_available} bets available
                    </Alert>
                    
                    <Paper elevation={3}>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell rowSpan={2}>Team</TableCell>
                                        <TableCell rowSpan={2}>Distance</TableCell>
                                        <TableCell align="center" colSpan={2}>Odds</TableCell>
                                        <TableCell align="center" colSpan={2}>Your Bets</TableCell>
                                        {tableData.round_stage === 'betting' && tableData.bets_available > 0 && (
                                            <TableCell align="center" rowSpan={2}>Action</TableCell>
                                        )}
                                    </TableRow>
                                    <TableRow>
                                        <TableCell align="center">1st Place</TableCell>
                                        <TableCell align="center">2nd Place</TableCell>
                                        <TableCell align="center">1st Place</TableCell>
                                        <TableCell align="center">2nd Place</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {tableData.teams.map((team) => (
                                        <TableRow key={team.id} sx={{
                                            bgcolor: team.is_player_team ? 'rgba(63, 81, 181, 0.08)' : 'inherit'
                                        }}>
                                            <TableCell component="th" scope="row">
                                                <Typography fontWeight={team.is_player_team ? 'bold' : 'normal'}>
                                                    {team.name} {team.is_player_team && '(You)'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>{team.distance}/{finishDistance}</TableCell>
                                            <TableCell align="center">{team.odd1}</TableCell>
                                            <TableCell align="center">{team.odd2}</TableCell>
                                            <TableCell align="center">{team.bet1}</TableCell>
                                            <TableCell align="center">{team.bet2}</TableCell>
                                            {tableData.round_stage === 'betting' && tableData.bets_available > 0 && (
                                                <TableCell align="center">
                                                    {!team.is_player_team ? (
                                                        <Button 
                                                            variant="contained" 
                                                            size="small" 
                                                            color="primary"
                                                            onClick={() => handleBetClick(team)}
                                                        >
                                                            Bet
                                                        </Button>
                                                    ) : (
                                                        <Typography variant="caption" color="textSecondary">
                                                            Can't bet on yourself
                                                        </Typography>
                                                    )}
                                                </TableCell>
                                            )}
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
