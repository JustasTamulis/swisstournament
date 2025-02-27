import * as React from 'react';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import LocalPizzaIcon from '@mui/icons-material/LocalPizza';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import {Link, useLocation} from 'react-router';

export default function Menu() {

    const location = useLocation();
    const path = location.pathname;
    console.log(path);

    return (
        <>
            <List
                sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}
                component="nav"
                aria-labelledby="nested-list-subheader"
            >

                <ListItemButton component={Link} to="/" selected={path === '/'} sx={{ display: 'flex', justifyContent: 'center' }}>
                    <ListItemIcon sx={{ display: 'flex', justifyContent: 'center' }}>
                        <LocalPizzaIcon />
                    </ListItemIcon>
                    
                </ListItemButton>

                <ListItemButton component={Link} to="/create" selected={path === '/create'} sx={{ display: 'flex', justifyContent: 'center' }}>
                    <ListItemIcon sx={{ display: 'flex', justifyContent: 'center' }}>
                        <AddCircleOutlineIcon />
                    </ListItemIcon>
                </ListItemButton>
                
            </List>
        </>
    );
}
