import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar';
import { IconButton } from '@mui/material';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import MenuIcon from '@mui/icons-material/Menu';
import Menu from './Menu';
import ShortMenu from './ShortMenu';
import Logo from '../../assets/pizza.png';

const drawerWidth = 240;
const shortdrawerWidth = 100;

export default function Navbar({ content }) {

    const [isBigMenu, setIsBigMenu] = React.useState(false);

    const changeMenu = () => {
        setIsBigMenu(!isBigMenu);
    }

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar>
                    <IconButton onClick={changeMenu} sx={{marginRight:'35px', color:'white'}}>
                        {isBigMenu ? <MenuOpenIcon/> : <MenuIcon/>}
                    </IconButton>
                    <img style={{ width: '10%' }} src={Logo} />
                </Toolbar>
            </AppBar>
            <Drawer
                variant="permanent"
                sx={{
                    width: isBigMenu ? drawerWidth : shortdrawerWidth,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: { width: isBigMenu ? drawerWidth : shortdrawerWidth, boxSizing: 'border-box' },
                }}
            >
                <Toolbar />
                {isBigMenu ? <Menu /> : <ShortMenu />}
            </Drawer>
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <Toolbar />
                {content}
            </Box>
        </Box>
    );
}
