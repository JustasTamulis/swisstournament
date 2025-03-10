import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import SportsKabaddiIcon from '@mui/icons-material/SportsKabaddi';
import RedeemIcon from '@mui/icons-material/Redeem';
import InfoIcon from '@mui/icons-material/Info';
import { useTournament } from '../../context/TournamentContext';

const useNavigateWithParams = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    
    const navigateWithParams = (path) => {
        const currentParams = new URLSearchParams(searchParams.toString());
        
        // Ensure the path starts with a slash to make it absolute
        const absolutePath = path.startsWith('/') ? path : `/${path}`;
        
        navigate({
            pathname: absolutePath,
            search: currentParams.toString()
        });
    };
    
    return navigateWithParams;
};

const TopNav = ({ content }) => {
    const location = useLocation();
    const navigateWithParams = useNavigateWithParams();
    const path = location.pathname;
    const { roundInfo, loading } = useTournament();

    // Define active path logic
    const isActive = (routePath) => {
        // Handle root path specially
        if (routePath === 'track' && (path === '/' || path === '/track')) {
            return { bgcolor: 'primary.dark' };
        }
        return path === `/${routePath}` ? { bgcolor: 'primary.dark' } : {};
    };

    // Define stage highlighting
    const getStageStyle = (buttonType) => {
        if (loading) return {};
        
        const isCurrentStage = (
            (buttonType === 'bet' && roundInfo?.stage === 'betting') ||
            (buttonType === 'joust' && roundInfo?.stage === 'joust') ||
            (buttonType === 'bonus' && roundInfo?.stage === 'bonus')
        );
        
        return isCurrentStage ? { 
            border: '2px solid #ffc107',
            borderRadius: '4px'
        } : {};
    };

    return (
        <>
            <AppBar position="static">
                <Toolbar sx={{ display: 'flex', justifyContent: 'space-around' }}>
                    <Button 
                        color="inherit" 
                        startIcon={<DirectionsRunIcon />}
                        onClick={() => navigateWithParams('track')}
                        sx={{ 
                            ...isActive('track'),
                            ...getStageStyle('track') 
                        }}
                    >
                        Track
                    </Button>
                    <Button 
                        color="inherit"
                        startIcon={<MonetizationOnIcon />}
                        onClick={() => navigateWithParams('bet')}
                        sx={{ 
                            ...isActive('bet'),
                            ...getStageStyle('bet') 
                        }}
                    >
                        Bet
                    </Button>
                    <Button 
                        color="inherit"
                        startIcon={<SportsKabaddiIcon />}
                        onClick={() => navigateWithParams('joust')}
                        sx={{ 
                            ...isActive('joust'),
                            ...getStageStyle('joust') 
                        }}
                    >
                        Joust
                    </Button>
                    <Button 
                        color="inherit"
                        startIcon={<RedeemIcon />}
                        onClick={() => navigateWithParams('bonus')}
                        sx={{ 
                            ...isActive('bonus'),
                            ...getStageStyle('bonus') 
                        }}
                    >
                        Bonus
                    </Button>
                    <Button 
                        color="inherit"
                        startIcon={<InfoIcon />}
                        onClick={() => navigateWithParams('about')}
                        sx={{ ...isActive('about') }}
                    >
                        About
                    </Button>
                </Toolbar>
            </AppBar>
            <Box sx={{ padding: 2 }}>
                {!loading && roundInfo?.number > 0 && (
                    <Box sx={{ 
                        mb: 2, 
                        p: 1, 
                        textAlign: 'center', 
                        bgcolor: 'primary.light',
                        color: 'white',
                        borderRadius: '4px' 
                    }}>
                        Round {roundInfo.number} - {roundInfo.stage.toUpperCase()} stage
                    </Box>
                )}
                {loading && !roundInfo ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : content}
            </Box>
        </>
    );
};

export default TopNav;
