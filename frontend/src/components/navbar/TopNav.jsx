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
    Button,
    Tooltip,
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
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'; // Add trophy icon
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
            <AppBar position="static" color="default" elevation={1}>
                <Container maxWidth="xl">
                    <Toolbar disableGutters>
                        {/* Mobile menu */}
                        {isMobile && (
                            <>
                                <IconButton
                                    size="large"
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

                        {/* App Title */}
                        <Typography
                            variant="h6"
                            noWrap
                            sx={{
                                mr: 2,
                                fontWeight: 700,
                                color: 'inherit',
                                textDecoration: 'none',
                                display: { xs: 'none', sm: 'flex' }
                            }}
                        >
                            Carnival Tournament
                        </Typography>
                        
                        {/* Mobile title - shorter */}
                        <Typography
                            variant="h6"
                            noWrap
                            sx={{
                                mr: 2,
                                fontWeight: 700,
                                color: 'inherit',
                                flexGrow: 1,
                                textDecoration: 'none',
                                display: { xs: 'flex', sm: 'none' }
                            }}
                        >
                            Tournament
                        </Typography>

                        {/* Desktop navigation tabs */}
                        {!isMobile && (
                            <Tabs 
                                value={getCurrentTabIndex()} 
                                onChange={handleTabChange}
                                indicatorColor="primary"
                                textColor="primary"
                                sx={{ flexGrow: 1 }}
                            >
                                {navItems.map((item) => (
                                    <Tab 
                                        key={item.name} 
                                        icon={item.icon} 
                                        label={item.label}
                                        iconPosition="start"
                                    />
                                ))}
                            </Tabs>
                        )}

                        {/* Round status section */}
                        {loading ? (
                            <CircularProgress size={24} sx={{ ml: 2 }} />
                        ) : roundInfo ? (
                            <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                ml: 'auto', 
                                backgroundColor: 'rgba(0, 0, 0, 0.04)', 
                                p: 1,
                                borderRadius: 1
                            }}>
                                <Typography variant="subtitle2" sx={{ mr: 1, display: { xs: 'none', sm: 'block' } }}>
                                    Round {roundInfo.number}:
                                </Typography>
                                {getStageBadge()}
                            </Box>
                        ) : null}
                    </Toolbar>
                </Container>
            </AppBar>

            {/* Main content */}
            <Container maxWidth="xl" sx={{ mt: 2 }}>
                {content}
            </Container>
        </>
    );
};

export default TopNav;
