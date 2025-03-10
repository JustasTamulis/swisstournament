import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useLocation, useNavigate, useSearchParams } from 'react-router';
import Logo from '../../assets/pizza.png';

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

    const isActive = (routePath) => {
        // Handle root path specially
        if (routePath === 'joust' && (path === '/' || path === '/joust')) {
            return { bgcolor: 'primary.dark' };
        }
        return path === `/${routePath}` ? { bgcolor: 'primary.dark' } : {};
    };

    return (
        <>
            <AppBar position="static">
                <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <img style={{ width: 40, marginRight: '10px' }} src={Logo} alt="Logo" />
                    </Box>
                    <Box sx={{ display: 'flex', flex: 1, justifyContent: 'space-around' }}>
                        <Button 
                            color="inherit" 
                            onClick={() => navigateWithParams('joust')}
                            sx={{ ...isActive('joust') }}
                        >
                            Joust
                        </Button>
                        <Button 
                            color="inherit" 
                            onClick={() => navigateWithParams('bet')}
                            sx={{ ...isActive('bet') }}
                        >
                            Bet
                        </Button>
                        <Button 
                            color="inherit" 
                            onClick={() => navigateWithParams('track')}
                            sx={{ ...isActive('track') }}
                        >
                            Track
                        </Button>
                        <Button 
                            color="inherit" 
                            onClick={() => navigateWithParams('bonus')}
                            sx={{ ...isActive('bonus') }}
                        >
                            Bonus
                        </Button>
                        <Button 
                            color="inherit" 
                            onClick={() => navigateWithParams('about')}
                            sx={{ ...isActive('about') }}
                        >
                            About
                        </Button>
                    </Box>
                </Toolbar>
            </AppBar>
            <Box sx={{ padding: 2 }}>
                {content}
            </Box>
        </>
    );
};

export default TopNav;
