import * as React from 'react';
import TextField from '@mui/material/TextField';

export default function MultilineTextFields({label, rows}) {
  return (
    <TextField
        id="outlined-multiline-static"
        sx = {{width:"100%", marginBottom:"10px"}}
        label={label}
        multiline
        rows={rows}
    />
  );
}
