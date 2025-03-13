import React, { useEffect, useState } from 'react';
import {
    AppBar,
    Box,
    Toolbar,
    IconButton,
    Typography,
    Menu,
    MenuItem,
    Container,
    Tabs,
    Tab,
    Chip,
    useMediaQuery,
    useTheme,
    CircularProgress,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import SportsKabaddiIcon from '@mui/icons-material/SportsKabaddi';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import InfoIcon from '@mui/icons-material/Info';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useTournament } from '../../context/TournamentContext';

const TopNav = ({ content }) => {
    // State for managing the mobile menu
    const [anchorElNav, setAnchorElNav] = useState(null);
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
    
    // Define nav items with icons and paths
    const navItems = [
        { name: 'track', icon: <DirectionsRunIcon />, label: 'Track' },
        { name: 'bet', icon: <MonetizationOnIcon />, label: 'Betting' },
        { name: 'joust', icon: <SportsKabaddiIcon />, label: 'Joust' },
        { name: 'bonus', icon: <CardGiftcardIcon />, label: 'Bonus' },
        { name: 'about', icon: <InfoIcon />, label: 'About' },
    ];

    const handleOpenNavMenu = (event) => {
        setAnchorElNav(event.currentTarget);
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };

    // Navigation with preserving URL parameters
    const handleNavigation = (path) => {
        handleCloseNavMenu();
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

    // Handle tab change
    const handleTabChange = (event, newValue) => {
        if (newValue >= 0 && newValue < navItems.length) {
            handleNavigation(navItems[newValue].name);
        }
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
            case 'finished':
                return (
                    <Chip 
                        icon={<EmojiEventsIcon />} 
                        label="Tournament Completed" 
                        color="error" 
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
                    <Toolbar disableGutters sx={{ minHeight: {xs: '48px'} }}>
                        {/* Mobile menu */}
                        {isMobile && (
                            <>
                                <IconButton
                                    size="small"
                                    aria-controls="menu-appbar"
                                    aria-haspopup="true"
                                    onClick={handleOpenNavMenu}
                                    color="inherit"
                                >
                                    <MenuIcon />
                                </IconButton>
                                <Menu
                                    id="menu-appbar"
                                    anchorEl={anchorElNav}
                                    anchorOrigin={{
                                        vertical: 'bottom',
                                        horizontal: 'left',
                                    }}
                                    keepMounted
                                    transformOrigin={{
                                        vertical: 'top',
                                        horizontal: 'left',
                                    }}
                                    open={Boolean(anchorElNav)}
                                    onClose={handleCloseNavMenu}
                                >
                                    {navItems.map((item) => (
                                        <MenuItem 
                                            key={item.name} 
                                            onClick={() => handleNavigation(item.name)}
                                            selected={currentPage === item.name}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                {item.icon}
                                                <Typography sx={{ ml: 1 }}>{item.label}</Typography>
                                            </Box>
                                        </MenuItem>
                                    ))}
                                </Menu>
                            </>
                        )}

                        {/* Navigation tabs - icons only */}
                        <Tabs 
                            value={getCurrentTabIndex()} 
                            onChange={handleTabChange}
                            indicatorColor="primary"
                            textColor="primary"
                            sx={{ 
                                flexGrow: 1,
                                '& .MuiTab-root': {
                                    minWidth: '50px',
                                    minHeight: '48px',
                                    padding: '6px',
                                }
                            }}
                            centered
                        >
                            {navItems.map((item, index) => {
                                const isCurrentTab = getCurrentTabIndex() === index;
                                return (
                                    <Tab 
                                        key={item.name} 
                                        icon={item.icon} 
                                        aria-label={item.label}
                                        sx={{ 
                                            border: isCurrentTab ? `1px solid ${theme.palette.primary.main}` : 'none',
                                            borderRadius: '4px',
                                            margin: '0 4px'
                                        }}
                                    />
                                );
                            })}
                        </Tabs>
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
