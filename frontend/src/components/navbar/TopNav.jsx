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
import TrackActiveCurrentImg from '../../assets/Buttons/Track-Inactive-Current.png';
import TrackActiveImg from '../../assets/Buttons/Track-Active.png';
import TrackInactiveCurrentImg from '../../assets/Buttons/Track-Active-Current.png';
import TrackInactiveImg from '../../assets/Buttons/Track-Inactive.png';
import BetActiveCurrentImg from '../../assets/Buttons/Bet-Inactive-Current.png';
import BetActiveImg from '../../assets/Buttons/Bet-Active.png';
import BetInactiveCurrentImg from '../../assets/Buttons/Bet-Active-Current.png';
import BetInactiveImg from '../../assets/Buttons/Bet-Inactive.png';
import JoustActiveCurrentImg from '../../assets/Buttons/Joust-Inactive-Current.png';
import JoustActiveImg from '../../assets/Buttons/Joust-Active.png';
import JoustInactiveCurrentImg from '../../assets/Buttons/Joust-Active-Current.png';
import JoustInactiveImg from '../../assets/Buttons/Joust-Inactive.png';
import BonusActiveCurrentImg from '../../assets/Buttons/Bonus-Inactive-Current.png';
import BonusActiveImg from '../../assets/Buttons/Bonus-Active.png';
import BonusInactiveCurrentImg from '../../assets/Buttons/Bonus-Active-Current.png';
import BonusInactiveImg from '../../assets/Buttons/Bonus-Inactive.png';
import AboutActiveCurrentImg from '../../assets/Buttons/About-Inactive-Current.png';
import AboutActiveImg from '../../assets/Buttons/About-Active.png';
import AboutInactiveCurrentImg from '../../assets/Buttons/About-Active-Current.png';
import AboutInactiveImg from '../../assets/Buttons/About-Inactive.png';

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

    // Map tab names to their corresponding button images
    const getButtonImage = (tabName, isActive) => {
        // Map tab names to stage names for comparison
        const tabToStage = {
            'bet': 'betting',
            'joust': 'joust',
            'bonus': 'bonus',
            // Track and About don't have corresponding stages
        };
        
        // Check if this tab corresponds to the current stage
        const isCurrent = roundInfo?.stage === tabToStage[tabName] || 
                         (roundInfo?.stage === 'final' && tabName === 'joust') ||
                         (roundInfo?.stage === 'final-multiple-ties' && tabName === 'joust');
        
        // Return the appropriate image based on state
        switch (tabName) {
            case 'track':
                return isActive 
                    ? (isCurrent ? TrackActiveCurrentImg : TrackActiveImg)
                    : (isCurrent ? TrackInactiveCurrentImg : TrackInactiveImg);
            case 'bet':
                return isActive 
                    ? (isCurrent ? BetActiveCurrentImg : BetActiveImg)
                    : (isCurrent ? BetInactiveCurrentImg : BetInactiveImg);
            case 'joust':
                return isActive 
                    ? (isCurrent ? JoustActiveCurrentImg : JoustActiveImg)
                    : (isCurrent ? JoustInactiveCurrentImg : JoustInactiveImg);
            case 'bonus':
                return isActive 
                    ? (isCurrent ? BonusActiveCurrentImg : BonusActiveImg)
                    : (isCurrent ? BonusInactiveCurrentImg : BonusInactiveImg);
            case 'about':
                return isActive 
                    ? (isCurrent ? AboutActiveCurrentImg : AboutActiveImg)
                    : (isCurrent ? AboutInactiveCurrentImg : AboutInactiveImg);
            default:
                return TrackInactiveImg; // Fallback
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
                                            }}
                                        >
                                            <img 
                                                src={getButtonImage(item.name, isCurrentTab)} 
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
