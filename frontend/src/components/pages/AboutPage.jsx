import React from 'react';
import { Box, Typography, Paper, Divider, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import FlagIcon from '@mui/icons-material/Flag';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SportsIcon from '@mui/icons-material/Sports';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';

const AboutPage = () => {
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
                
                <Typography variant="body1" paragraph>
                    This tournament is designed to be a fun and competitive experience for all participants.
                    Below are the rules and information about how the tournament works.
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
                            primary="Race to 12 Points" 
                            secondary="The first team to reach 12 points on the track wins the tournament." 
                        />
                    </ListItem>
                    
                    <ListItem>
                        <ListItemIcon>
                            <SportsIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                            primary="Jousting" 
                            secondary="Teams will be randomly paired for jousting matches. Winners move forward on the track." 
                        />
                    </ListItem>
                    
                    <ListItem>
                        <ListItemIcon>
                            <EmojiEventsIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                            primary="Betting" 
                            secondary="Each team has betting points to place on who they think will win matches." 
                        />
                    </ListItem>
                    
                    <ListItem>
                        <ListItemIcon>
                            <CardGiftcardIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                            primary="Bonuses" 
                            secondary="After each round, teams may receive bonuses that can be used for various advantages." 
                        />
                    </ListItem>
                </List>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                    This tournament is hosted for entertainment purposes. Have fun and may the best team win!
                </Typography>
            </Paper>
        </Box>
    );
};

export default AboutPage;
