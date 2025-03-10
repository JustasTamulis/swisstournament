import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import { useSearchParams } from 'react-router';

const BetPage = () => {
    const [searchParams] = useSearchParams();
    const [teams, setTeams] = useState([]);

    // Read query parameters
    useEffect(() => {
        console.log("Query Parameters in Bet Page:");
        for (const [key, value] of searchParams.entries()) {
            console.log(`${key}: ${value}`);
        }
        
        // Simulate teams data
        setTeams([
            { id: 1, name: 'Team A', odds: 1.5, betCount: 3 },
            { id: 2, name: 'Team B', odds: 2.0, betCount: 2 },
            { id: 3, name: 'Team C', odds: 3.0, betCount: 1 },
        ]);
    }, [searchParams]);

    return (
        <Box sx={{ padding: 2 }}>
            <Box className="TopBar" sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <MonetizationOnIcon />
                <Typography sx={{marginLeft: '15px', fontWeight: 'bold'}} variant='h6'>
                    Current Odds & Bets
                </Typography>
            </Box>
            
            <Paper elevation={3}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Team</TableCell>
                                <TableCell align="right">Odds</TableCell>
                                <TableCell align="right">Total Bets</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {teams.map((team) => (
                                <TableRow key={team.id}>
                                    <TableCell component="th" scope="row">
                                        {team.name}
                                    </TableCell>
                                    <TableCell align="right">{team.odds}</TableCell>
                                    <TableCell align="right">{team.betCount}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    );
};

export default BetPage;
