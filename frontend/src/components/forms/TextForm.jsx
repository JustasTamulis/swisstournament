import * as React from 'react';
import TextField from '@mui/material/TextField';

export default function TextForm({label}) {
    return (
        <TextField 
            id="standard-basic" 
            sx={{width:"100%", marginBottom:"10px"}}
            label={label}
            variant="outlined" 
        />
    );
}
