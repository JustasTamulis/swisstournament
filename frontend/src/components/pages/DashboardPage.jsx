import React, { useState, useEffect } from 'react';
import { 
    Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
    TableHead, TableRow, Button, CircularProgress, Alert, Link
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { getAllTeams, getRoundInfo } from '../../services/tournamentService';

// Heroku app URL as a constant for easy updating
const HEROKU_URL = 'https://bday2025-daa089d5c915.herokuapp.com';
const LOCAL_URL = window.location.origin;

const DashboardPage = () => {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [roundInfo, setRoundInfo] = useState(null);
    const [stageStatuses, setStageStatuses] = useState({});

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
    
    // Mock status data - the backend would provide real status
    // This simulates the data for demonstration purposes
    const getMockStatusForTeam = (teamId) => {
        // Generate predictable but seemingly random status for demo
        const seed = teamId % 4; // 0, 1, 2, or 3
        return {
            bet_finished: [true, false, true, false][seed],
            joust_finished: [true, true, false, false][seed],
            bonus_used: [false, true, true, false][seed]
        };
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

    if (loading) {
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
            
            {roundInfo && (
                <Alert severity="info" sx={{ mb: 2 }}>
                    Current round: {roundInfo.number}, Stage: {roundInfo.stage}
                </Alert>
            )}
            
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
                                <TableCell align="center">Bet Status</TableCell>
                                <TableCell align="center">Joust Status</TableCell>
                                <TableCell align="center">Bonus Status</TableCell>
                                <TableCell>Local Link</TableCell>
                                <TableCell>Heroku Link</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {teams.map((team) => {
                                const localLink = `${LOCAL_URL}/?player_id=${team.identifier}`;
                                const herokuLink = `${HEROKU_URL}/?player_id=${team.identifier}`;
                                
                                // Get team status (either real from API or mock data for demo)
                                const teamStatus = stageStatuses[team.id] || getMockStatusForTeam(team.id);
                                
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
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Link href={herokuLink} target="_blank" sx={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                                                    {herokuLink}
                                                </Link>
                                                <Button 
                                                    variant="outlined" 
                                                    size="small"
                                                    onClick={() => copyToClipboard(herokuLink)}
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
        </Box>
    );
};

export default DashboardPage;
