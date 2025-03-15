import React from 'react';
import { Box, Typography, Paper, Divider, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import FlagIcon from '@mui/icons-material/Flag';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SportsIcon from '@mui/icons-material/Sports';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import GroupIcon from '@mui/icons-material/Group';
import StarIcon from '@mui/icons-material/Star';
import BalanceIcon from '@mui/icons-material/Balance';
import { useTournament } from '../../context/TournamentContext';

const AboutPage = () => {
    // Get the finish distance from context
    const { finishDistance } = useTournament();
    
    return (
        <Box sx={{ padding: 2 }}>
            <Box className="TopBar" sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <InfoIcon />
                <Typography sx={{marginLeft: '15px', fontWeight: 'bold'}} variant='h6'>
                    About the Tournament
                </Typography>
            </Box>
            
            <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>
                    Welcome to the Birthday Tournament 2025!
                </Typography>
                
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="h6" gutterBottom>
                    Tournament Rules
                </Typography>
                
                <List>
                    <ListItem>
                        <ListItemIcon>
                            <FlagIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                            primary={`Race to ${finishDistance} Points`} 
                            secondary={`The first team to reach ${finishDistance} points on the track wins the tournament as the Race Winner. There will also be an Oracle Winner determined by the betting results.`} 
                        />
                    </ListItem>
                    
                    <ListItem>
                        <ListItemIcon>
                            <SportsIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                            primary="Jousting" 
                            secondary="Teams will be randomly paired for jousting matches only in the first round. After that, teams move along the track based on their performance. Winners move forward to the next location, towards lova, losers go down. In case of choice during a match (e.g., who starts), the previous round's loser gets to choose." 
                        />
                    </ListItem>
                    
                    <ListItem>
                        <ListItemIcon>
                            <EmojiEventsIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                            primary="Betting" 
                            secondary="Each team has betting points to place on who they think will win the tournament. When betting, you select which team you think will win the race. If that team wins 1st place, you receive the larger odd; if 2nd place, you receive the smaller odd. Your odds accumulate through rounds, determining your final betting score." 
                        />
                    </ListItem>
                    
                    <ListItem>
                        <ListItemIcon>
                            <CardGiftcardIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                            primary="Bonuses" 
                            secondary="After each round, teams may receive bonuses. Winning teams receive a bonus every 3 distance points. Bonuses include extra bets, adding/removing distance for teams, and selecting locations for the next round. Teams that lose 3 times in a row at the lowest location receive a compensation bonus." 
                        />
                    </ListItem>

                    <ListItem>
                        <ListItemIcon>
                            <BalanceIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                            primary="Tie-Breaking" 
                            secondary="If two teams tie for first place at the finish line, a tie-breaking match will decide the winner. If more than two teams tie, the finish distance will be increased. For second place ties, similar rules apply, with potential manual selection if necessary." 
                        />
                    </ListItem>

                    <ListItem>
                        <ListItemIcon>
                            <GroupIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                            primary="Winners" 
                            secondary="There will be two winners: the Race Winner (team that reaches the finish line first) and the Oracle Winner (team with the highest betting points based on their predictions)." 
                        />
                    </ListItem>
                </List>
                
                <Divider sx={{ my: 2 }} />
            </Paper>
        </Box>
    );
};

export default AboutPage;
