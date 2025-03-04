import * as React from 'react';
import TextField from '@mui/material/TextField';

export default function TextForm({label, value, name, onChange, onBlur, error, helperText}) {
    return (
        <TextField 
            id="standard-basic" 
            sx={{width:"100%", marginBottom:"10px"}}
            label={label}
            variant="outlined" 
            value = {value}
            name = {name}
            onChange = {onChange}
            onBlur = {onBlur}
            error = {error}
            helperText = {helperText}
        />
    );
}
