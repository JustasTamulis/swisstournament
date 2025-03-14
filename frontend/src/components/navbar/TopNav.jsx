import React, { useState } from 'react';
import {
    AppBar,
    Box,
    Toolbar,
    Typography,
    Container,
    Tabs,
    Chip,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import SportsKabaddiIcon from '@mui/icons-material/SportsKabaddi';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useTournament } from '../../context/TournamentContext';
import BetIcon from '../../assets/Bet.svg'; // Using this for all buttons for testing

const TopNav = ({ content }) => {
    const [searchParams] = useSearchParams();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    // Get tournament context
    const { roundInfo, loading, currentPage } = useTournament();

    // Extract round stage for conditional logic
    const roundStage = roundInfo?.stage;

    // Get the player_id from URL params for preserving across navigation
    const playerId = searchParams.get('player_id');
    
    const location = useLocation();
    const navigate = useNavigate();
    
    // Define nav items with paths and labels
    const navItems = [
        { name: 'track', label: 'Track' },
        { name: 'bet', label: 'Betting' },
        { name: 'joust', label: 'Joust' },
        { name: 'bonus', label: 'Bonus' },
        { name: 'about', label: 'About' },
    ];

    // Navigation with preserving URL parameters
    const handleNavigation = (path) => {
        const queryParams = new URLSearchParams(location.search);
        navigate(`/${path}${queryParams.toString() ? '?' + queryParams.toString() : ''}`);
    };

    // Determine current tab index
    const getCurrentTabIndex = () => {
        // Extract the path from location.pathname (remove leading slash and get first part)
        const path = location.pathname.split('/').filter(Boolean)[0] || 'track';
        
        // Special case: in final stage, highlight the joust tab
        if (roundStage === 'final' && path === 'joust') {
            return navItems.findIndex(item => item.name === 'joust');
        }
        
        return Math.max(0, navItems.findIndex(item => item.name === path));
    };

    // Function to get stage badge for current round
    const getStageBadge = () => {
        if (!roundInfo) return null;
        
        // Return different badge based on stage
        switch (roundInfo.stage) {
            case 'betting':
                return (
                    <Chip 
                        icon={<MonetizationOnIcon />}
                        label="Betting Stage" 
                        color="primary" 
                        variant="outlined"
                        size="small" 
                    />
                );
            case 'joust':
                return (
                    <Chip 
                        icon={<SportsKabaddiIcon />} 
                        label="Joust Stage" 
                        color="secondary" 
                        variant="outlined"
                        size="small" 
                    />
                );
            case 'bonus':
                return (
                    <Chip 
                        icon={<CardGiftcardIcon />} 
                        label="Bonus Stage" 
                        color="success" 
                        variant="outlined"
                        size="small" 
                    />
                );
            case 'final':
                return (
                    <Chip 
                        icon={<EmojiEventsIcon />} 
                        label="Final Tiebreaker" 
                        color="warning" 
                        variant="outlined"
                        size="small" 
                        sx={{ fontWeight: 'bold' }}
                    />
                );
            case 'final-multiple-ties':
                return (
                    <Chip 
                        icon={<EmojiEventsIcon />} 
                        label="Second Place Selection" 
                        color="warning" 
                        variant="outlined"
                        size="small" 
                        sx={{ fontWeight: 'bold' }}
                    />
                );
            default:
                return (
                    <Chip 
                        label={`Round ${roundInfo.number}`} 
                        variant="outlined"
                        size="small" 
                    />
                );
        }
    };

    return (
        <>
            <AppBar position="static" color="default" elevation={1} sx={{ mb: 2 }}>
                <Container maxWidth="xl">
                    <Toolbar disableGutters sx={{ minHeight: {xs: '60px'} }}> {/* Increased toolbar height */}
                        {/* Navigation buttons - using image buttons for all */}
                        <Box 
                            sx={{ 
                                display: 'flex', 
                                justifyContent: 'center', 
                                alignItems: 'center',
                                width: '100%',
                                overflow: 'hidden' // Prevent horizontal scrolling
                            }}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between', // Changed to space-between for better distribution
                                    alignItems: 'center',
                                    width: '100%', 
                                    maxWidth: {xs: '100%', sm: '500px'}, // Control max width for different screen sizes
                                }}
                            >
                                {navItems.map((item, index) => {
                                    const isCurrentTab = getCurrentTabIndex() === index;
                                    
                                    return (
                                        <Box 
                                            key={item.name}
                                            onClick={() => handleNavigation(item.name)}
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer',
                                                filter: isCurrentTab ? 'grayscale(100%)' : 'none',
                                            }}
                                        >
                                            <img 
                                                src={BetIcon} 
                                                alt={item.label} 
                                                style={{ 
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'contain',
                                                }} 
                                            />
                                        </Box>
                                    );
                                })}
                            </Box>
                        </Box>
                    </Toolbar>
                </Container>
            </AppBar>

            {/* Main content */}
            <Container maxWidth="xl" sx={{ position: 'relative', pb: 7 }}>
                {content}
            </Container>

            {/* Floating round info at bottom center */}
            {!loading && roundInfo && (
                <Box sx={{ 
                    position: 'fixed',
                    bottom: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: 'background.paper',
                    boxShadow: 3,
                    borderRadius: '16px',
                    px: 2,
                    py: 1,
                }}>
                    <Typography variant="subtitle2" sx={{ mr: 1 }}>
                        Round {roundInfo.number}:
                    </Typography>
                    {getStageBadge()}
                </Box>
            )}
        </>
    );
};

export default TopNav;
