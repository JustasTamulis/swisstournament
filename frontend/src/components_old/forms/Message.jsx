import * as React from 'react';
import {Box, Typography } from "@mui/material";

export default function MyMessage({messageText, messageColor}) {
    return (
        <Box
            sx={{
                display: 'flex',
                width: '100%',
                height: '30px',
                color: 'white',
                marginBottom: '10px',
                padding: '10px',
                backgroundColor: messageColor,
                alignItems: 'center',
            }}
        >
            <Typography variant="h5" component="h2">
                {messageText}
            </Typography>
        </Box>
    );
}
