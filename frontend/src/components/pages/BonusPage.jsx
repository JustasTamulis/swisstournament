import React, { useState, useEffect, useRef } from 'react';
import { 
    Box, Typography, Paper, Button, CircularProgress, Alert,
    Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
    FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import RedeemIcon from '@mui/icons-material/Redeem';
import { useSearchParams } from 'react-router-dom';
import { 
    getTeamByIdentifier, getBonusForTeam, useBonus, getBettingTable
} from '../../services/tournamentService';
import { useTournament } from '../../context/TournamentContext';

// Import locations from context or define here
const LOCATIONS = [
    "Biblioteka",
    "Stalas",
    "Sofa", 
    "Lova"
];

const BonusPage = () => {
    const [searchParams] = useSearchParams();
    const [playerTeam, setPlayerTeam] = useState(null);
    const [bonus, setBonus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const pollingInterval = useRef(null);
    const [teams, setTeams] = useState([]);
    
    // Dialog state
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedBonus, setSelectedBonus] = useState(null);
    const [targetTeam, setTargetTeam] = useState('');
    const [showTargetSelect, setShowTargetSelect] = useState(false);
    const [showLocationSelect, setShowLocationSelect] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState('');
    
    // Get tournament context
    const { roundInfo, roundChanged } = useTournament();
    
    // Extract only the properties we need to depend on
    const roundId = roundInfo?.round_id;
    const roundStage = roundInfo?.stage;
    
    // Get the player_id from URL params
    const playerId = searchParams.get('player_id');

    console.log("BonusPage playerId:", playerId);
    console.log("playerTeam", playerTeam);

    // Fetch necessary data only on mount or round/stage change
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
                
                // Get player team info
                const playerTeamData = await getTeamByIdentifier(playerId);
                setPlayerTeam(playerTeamData);
                
                // Check if player has an available bonus
                if (playerTeamData) {
                    const bonusData = await getBonusForTeam(playerId, roundId);
                    setBonus(bonusData);
                    
                    // Fetch available teams for targeting
                    const tableData = await getBettingTable(playerId, roundId);
                    if (tableData && tableData.teams) {
                        setTeams(tableData.teams.filter(team => team.id !== playerTeamData.id));
                    }
                }
            } catch (err) {
                console.error("Error fetching bonus data:", err);
                setError('Failed to load bonus data. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
        
    }, [playerId, roundId, roundStage, roundChanged]);

    const handleBonusSelect = (bonusType) => {
        setSelectedBonus(bonusType);
        
        // Determine if we need to show target selection
        if (bonusType === 'plus_distance' || bonusType === 'minus_distance') {
            setShowTargetSelect(true);
            setShowLocationSelect(false);
        } else if (bonusType === 'select_location') {
            setShowLocationSelect(true);
            setShowTargetSelect(false);
        } else {
            setShowTargetSelect(false);
            setShowLocationSelect(false);
        }
        
        setDialogOpen(true);
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
        setSelectedBonus(null);
        setTargetTeam('');
        setShowTargetSelect(false);
        setShowLocationSelect(false);
        setSelectedLocation('');
    };

    const handleBonusConfirm = async () => {
        if (!playerTeam || !selectedBonus || !roundInfo) {
            setError('Missing required information to use bonus');
            handleDialogClose();
            return;
        }
        
        // Check if we need a target and if it's selected
        if ((selectedBonus === 'plus_distance' || selectedBonus === 'minus_distance') && !targetTeam) {
            setError('You must select a target team for this bonus type');
            return;
        }
        
        // Check if we need a location and if it's selected
        if (selectedBonus === 'select_location' && !selectedLocation) {
            setError('You must select a location for this bonus type');
            return;
        }
        
        try {
            setLoading(true);
            
            // Prepare bonus data
            const bonusData = {
                team_id: playerTeam.id,
                bonus_type: selectedBonus,
                round_id: roundInfo.round_id
            };
            
            // Add target team if needed
            if (selectedBonus === 'plus_distance' || selectedBonus === 'minus_distance') {
                bonusData.bonus_target = targetTeam;
            }
            
            // Add target location if needed
            if (selectedBonus === 'select_location') {
                bonusData.bonus_target = selectedLocation;
            }
            
            await useBonus(bonusData);
            
            // Update bonus status
            const bonusData2 = await getBonusForTeam(playerId, roundInfo.round_id);
            setBonus(bonusData2);
            
            handleDialogClose();
        } catch (err) {
            console.error("Error using bonus:", err);
            setError(err.response?.data?.error || 'Failed to use bonus. Please try again.');
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
                                onClick={() => handleBonusSelect('plus_distance')}
                                sx={{ height: '100px' }}
                            >
                                Increase Team Distance (+1)
                            </Button>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Button 
                                variant="outlined" 
                                fullWidth 
                                onClick={() => handleBonusSelect('minus_distance')}
                                sx={{ height: '100px' }}
                            >
                                Decrease Team Distance (-1)
                            </Button>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Button 
                                variant="outlined" 
                                fullWidth 
                                onClick={() => handleBonusSelect('select_location')}
                                sx={{ height: '100px' }}
                            >
                                Select Next Round Location
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
                    
                    {showTargetSelect && (
                        <FormControl fullWidth sx={{ mt: 2 }}>
                            <InputLabel id="target-team-label">Select Target Team</InputLabel>
                            <Select
                                labelId="target-team-label"
                                id="target-team-select"
                                value={targetTeam}
                                label="Target Team"
                                onChange={(e) => setTargetTeam(e.target.value)}
                            >
                                {teams.map((team) => (
                                    <MenuItem key={team.id} value={team.id}>
                                        {team.name} (Distance: {team.distance})
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}
                    
                    {showLocationSelect && (
                        <FormControl fullWidth sx={{ mt: 2 }}>
                            <InputLabel id="location-label">Select Location</InputLabel>
                            <Select
                                labelId="location-label"
                                id="location-select"
                                value={selectedLocation}
                                label="Location"
                                onChange={(e) => setSelectedLocation(e.target.value)}
                            >
                                {LOCATIONS.map((location) => (
                                    <MenuItem key={location} value={location}>
                                        {location}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose} color="primary">
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleBonusConfirm} 
                        color="primary" 
                        autoFocus
                        disabled={(showTargetSelect && !targetTeam) || (showLocationSelect && !selectedLocation)}
                    >
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
        case 'extra_bet':
            return 'Get Extra Bet';
        case 'plus_distance':
            return 'Increase Team Distance (+1)';
        case 'minus_distance':
            return 'Decrease Team Distance (-1)';
        case 'select_location':
            return 'Select Next Round Location';
        default:
            return bonusType;
    }
}

export default BonusPage;
