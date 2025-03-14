import React, { useState, useEffect } from 'react';
import { 
    Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
    TableHead, TableRow, Button, CircularProgress, Alert, Link,
    Divider, Card, CardContent, CardActions, Grid, Dialog, DialogActions,
    DialogContent, DialogContentText, DialogTitle, Tooltip, Chip
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { 
    getAllTeams, getRoundInfo, getTournamentResults, setSecondPlaceWinner,
    getGamesForRound
} from '../../services/tournamentService';

// Local URL constant
const LOCAL_URL = window.location.origin;

const DashboardPage = () => {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [roundInfo, setRoundInfo] = useState(null);
    const [stageStatuses, setStageStatuses] = useState({});
    const [tournamentResults, setTournamentResults] = useState(null);
    const [secondPlaceTies, setSecondPlaceTies] = useState([]);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [selectedTeamId, setSelectedTeamId] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [firstPlace, setFirstPlace] = useState(null);
    const [games, setGames] = useState([]);
    const [teamLocations, setTeamLocations] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Get current round info
                const roundData = await getRoundInfo();
                setRoundInfo(roundData);
                
                // Get all teams
                const teamsData = await getAllTeams();
                setTeams(teamsData);
                
                // Fetch stage statuses for all teams
                const statuses = await fetchTeamStageStatuses(teamsData, roundData?.round_id);
                setStageStatuses(statuses);
                
                // Fetch games for current round to get locations
                if (roundData.round_id) {
                    try {
                        const gamesData = await getGamesForRound(roundData.round_id);
                        setGames(gamesData);
                        
                        // Create a mapping of team ID to their game location
                        const locationMap = {};
                        gamesData.forEach(game => {
                            if (game.location) {
                                locationMap[game.team1] = game.location;
                                locationMap[game.team2] = game.location;
                            }
                        });
                        setTeamLocations(locationMap);
                    } catch (gameError) {
                        console.error("Failed to fetch games:", gameError);
                    }
                }
                
                // If in finished stage, get tournament results
                if (roundData.stage === 'finished') {
                    const results = await getTournamentResults();
                    setTournamentResults(results);
                    
                    // If there's no second place winner yet, find potential second place teams
                    if (results && results.active && !results.second_place) {
                        // Find teams tied for second place (all teams not in first place with highest distance)
                        const firstPlaceId = results.first_place.id;
                        const nonWinnerTeams = teamsData.filter(team => team.id !== firstPlaceId);
                        
                        if (nonWinnerTeams.length > 0) {
                            // Find max distance among non-winners
                            const maxDistance = Math.max(...nonWinnerTeams.map(team => team.distance));
                            // Filter teams with that distance
                            const tiedTeams = nonWinnerTeams.filter(team => team.distance === maxDistance);
                            setSecondPlaceTies(tiedTeams);
                        }
                    }
                } 
                // Special handling for final-multiple-ties stage
                else if (roundData.stage === 'final-multiple-ties') {
                    // Find first place team (highest distance)
                    const firstPlaceTeam = teamsData.sort((a, b) => b.distance - a.distance)[0];
                    setFirstPlace(firstPlaceTeam);
                    
                    // Find all teams tied for second place
                    // (teams with highest distance excluding first place)
                    const nonWinnerTeams = teamsData.filter(team => team.id !== firstPlaceTeam.id);
                    
                    if (nonWinnerTeams.length > 0) {
                        // Find max distance among non-winners
                        const maxDistance = Math.max(...nonWinnerTeams.map(team => team.distance));
                        // Filter teams with that distance
                        const tiedTeams = nonWinnerTeams.filter(team => team.distance === maxDistance);
                        setSecondPlaceTies(tiedTeams);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch data:", err);
                setError('Failed to load dashboard data. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Fetch stage statuses for all teams
    const fetchTeamStageStatuses = async (teams, roundId) => {
        if (!roundId) return {};
        
        try {
            // Make a single API call to get status for all teams
            const response = await fetch(`/api/team-stage-statuses/?round_id=${roundId}`);
            if (!response.ok) {
                throw new Error(`Error fetching team statuses: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Failed to fetch team statuses:", error);
            // Return empty statuses - we'll show neutral indicators
            return teams.reduce((acc, team) => {
                acc[team.id] = { bet_finished: null, joust_finished: null, bonus_used: null };
                return acc;
            }, {});
        }
    };

    // Helper function to copy link to clipboard
    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(
            () => {
                alert('Link copied to clipboard!');
            },
            (err) => {
                console.error('Could not copy text: ', err);
            }
        );
    };
    
    // Helper to render status indicator
    const renderStatusIndicator = (status) => {
        let backgroundColor;
        
        if (status === null) {
            // Status unknown or not applicable
            backgroundColor = '#e0e0e0'; // Neutral gray
        } else if (status === true) {
            backgroundColor = 'rgba(76, 175, 80, 0.6)'; // Green with opacity
        } else {
            backgroundColor = 'rgba(244, 67, 54, 0.6)'; // Red with opacity
        }
        
        return (
            <Box 
                sx={{
                    width: 24,
                    height: 24,
                    backgroundColor,
                    borderRadius: 1,
                    margin: '0 auto'
                }}
            />
        );
    };

    // Handle selecting a team for second place
    const handleSelectSecondPlace = (teamId) => {
        setSelectedTeamId(teamId);
        setConfirmDialogOpen(true);
    };

    // Close the confirmation dialog
    const handleCloseDialog = () => {
        setConfirmDialogOpen(false);
        setSelectedTeamId(null);
    };

    // Confirm selecting a team as second place
    const handleConfirmSecondPlace = async () => {
        if (!selectedTeamId) return;
        
        try {
            setLoading(true);
            const result = await setSecondPlaceWinner(selectedTeamId);
            
            const selectedTeam = secondPlaceTies.find(team => team.id === selectedTeamId);
            setSuccessMessage(`${selectedTeam.name} has been set as second place!`);
            
            // Update round info - we should now be in 'finished' stage
            const updatedRoundInfo = await getRoundInfo();
            setRoundInfo(updatedRoundInfo);
            
            // If we're now in finished stage, get tournament results
            if (updatedRoundInfo.stage === 'finished') {
                const updatedResults = await getTournamentResults();
                setTournamentResults(updatedResults);
            }
            
            // Clear second place ties
            setSecondPlaceTies([]);
            
        } catch (err) {
            setError('Failed to set second place winner. Please try again.');
            console.error("Error setting second place:", err);
        } finally {
            setLoading(false);
            setConfirmDialogOpen(false);
        }
    };

    // Helper function to get team location
    const getTeamLocation = (teamId) => {
        return teamLocations[teamId] || 'Not assigned';
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
                <DashboardIcon />
                <Typography sx={{marginLeft: '15px', fontWeight: 'bold'}} variant='h6'>
                    Admin Dashboard
                </Typography>
            </Box>
            
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}
            
            {roundInfo && (
                <Alert severity="info" sx={{ mb: 2 }}>
                    Current round: {roundInfo.number}, Stage: {roundInfo.stage}
                </Alert>
            )}
            
            {/* Second place selection section - now handles both finished and final-multiple-ties stages */}
            {(roundInfo?.stage === 'finished' || roundInfo?.stage === 'final-multiple-ties') && secondPlaceTies.length > 0 && (
                <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <EmojiEventsIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h6">
                            Select Second Place Winner
                        </Typography>
                    </Box>
                    
                    {roundInfo?.stage === 'final-multiple-ties' && firstPlace && (
                        <Alert severity="info" sx={{ mb: 2 }}>
                            {firstPlace.name} has secured first place! Please select one team from 
                            the {secondPlaceTies.length} teams tied for second place.
                        </Alert>
                    )}
                    
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        There are {secondPlaceTies.length} teams tied for second place. Please select one:
                    </Typography>
                    
                    <Grid container spacing={2}>
                        {secondPlaceTies.map(team => (
                            <Grid item xs={12} sm={6} md={4} key={team.id}>
                                <Card variant="outlined">
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>{team.name}</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Distance: {team.distance}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                                            {team.description}
                                        </Typography>
                                    </CardContent>
                                    <CardActions>
                                        <Button 
                                            size="small" 
                                            color="primary"
                                            variant="contained"
                                            onClick={() => handleSelectSecondPlace(team.id)}
                                        >
                                            Select as Second Place
                                        </Button>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Paper>
            )}
            
            {/* Tournament results section */}
            {tournamentResults && tournamentResults.active && (
                <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
                    <Typography variant="h6" gutterBottom>Tournament Results</Typography>
                    
                    <Box sx={{ display: 'flex', gap: 4, my: 2 }}>
                        <Box>
                            <Typography variant="subtitle1" fontWeight="bold">First Place:</Typography>
                            <Typography>{tournamentResults.first_place.name}</Typography>
                        </Box>
                        
                        <Box>
                            <Typography variant="subtitle1" fontWeight="bold">Second Place:</Typography>
                            <Typography>
                                {tournamentResults.second_place ? 
                                    tournamentResults.second_place.name : 
                                    "Not determined yet"}
                            </Typography>
                        </Box>
                    </Box>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Typography variant="h6" gutterBottom>Betting Results</Typography>
                    
                    <TableContainer>
                        <Table size="small">
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
                                {tournamentResults.betting_results.map((result, index) => (
                                    <TableRow key={result.team.id}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{result.team.name}</TableCell>
                                        <TableCell align="center">{result.first_place_points.toFixed(2)}</TableCell>
                                        <TableCell align="center">{result.second_place_points.toFixed(2)}</TableCell>
                                        <TableCell align="center">{result.total_points.toFixed(2)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            )}
            
            {/* Teams table */}
            <Paper elevation={3}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>Identifier</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Description</TableCell>
                                <TableCell>Bets Available</TableCell>
                                <TableCell>Distance</TableCell>
                                <TableCell>Location</TableCell>
                                <TableCell align="center">Bet Status</TableCell>
                                <TableCell align="center">Joust Status</TableCell>
                                <TableCell align="center">Bonus Status</TableCell>
                                <TableCell>Local Link</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {teams.map((team) => {
                                const localLink = `${LOCAL_URL}/?player_id=${team.identifier}`;
                                
                                // Get team status (either real from API or mock data for demo)
                                const teamStatus = stageStatuses[team.id] || getMockStatusForTeam(team.id);
                                
                                // Get team location
                                const location = getTeamLocation(team.id);
                                
                                return (
                                    <TableRow key={team.id}>
                                        <TableCell>{team.id}</TableCell>
                                        <TableCell>{team.identifier}</TableCell>
                                        <TableCell>{team.name}</TableCell>
                                        <TableCell 
                                            sx={{ 
                                                maxWidth: '200px',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}
                                        >
                                            {team.description}
                                        </TableCell>
                                        <TableCell>{team.bets_available}</TableCell>
                                        <TableCell>{team.distance}</TableCell>
                                        
                                        {/* Location Cell */}
                                        <TableCell>
                                            {location !== 'Not assigned' ? (
                                                <Tooltip title={`Playing at ${location}`}>
                                                    <Chip 
                                                        size="small" 
                                                        icon={<LocationOnIcon />} 
                                                        label={location} 
                                                        color="primary" 
                                                        variant="outlined"
                                                    />
                                                </Tooltip>
                                            ) : (
                                                'Not assigned'
                                            )}
                                        </TableCell>
                                        
                                        {/* Status Indicators */}
                                        <TableCell align="center">
                                            {renderStatusIndicator(teamStatus.bet_finished)}
                                        </TableCell>
                                        <TableCell align="center">
                                            {renderStatusIndicator(teamStatus.joust_finished)}
                                        </TableCell>
                                        <TableCell align="center">
                                            {renderStatusIndicator(teamStatus.bonus_used)}
                                        </TableCell>
                                        
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Link href={localLink} target="_blank" sx={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                                                    {localLink}
                                                </Link>
                                                <Button 
                                                    variant="outlined" 
                                                    size="small"
                                                    onClick={() => copyToClipboard(localLink)}
                                                >
                                                    Copy
                                                </Button>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
            
            {/* Confirmation Dialog */}
            <Dialog
                open={confirmDialogOpen}
                onClose={handleCloseDialog}
            >
                <DialogTitle>Confirm Second Place Selection</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to choose this team as the second place winner? This action cannot be undone.
                        {roundInfo?.stage === 'final-multiple-ties' && 
                         " This will increase both first and second place teams' distances by 1."}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleConfirmSecondPlace} variant="contained" color="primary">
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

// Helper function to generate mock status data when API data isn't available
function getMockStatusForTeam(teamId) {
    // Generate predictable but seemingly random status for demo
    const seed = teamId % 4; // 0, 1, 2, or 3
    return {
        bet_finished: [true, false, true, false][seed],
        joust_finished: [true, true, false, false][seed],
        bonus_used: [false, true, true, false][seed]
    };
}

export default DashboardPage;
