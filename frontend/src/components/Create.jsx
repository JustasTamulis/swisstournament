import {React, useState, useEffect} from "react";
import AxiosInstance from "./Axios"; 
import {Box, Typography} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import Button from '@mui/material/Button';

import TextForm from "./forms/TextForm";
import SelectForm from "./forms/SelectForm";
import MultipleSelectForm from "./forms/MultiSelectForm";
import DescriptionForm from "./forms/DescriptionForm";

const Create = () => {
    const [country, setCountry] = useState([]);
    const [league, setLeague] = useState([]);
    const [characteristic, setCharacteristic] = useState([]);

    console.log(country);
    console.log(league);
    console.log(characteristic);

    const GetData = () => {
        AxiosInstance.get("country/")
        .then((response) => {
            setCountry(response.data);
        })

        AxiosInstance.get("league/")
        .then((response) => {
            setLeague(response.data);
        })

        AxiosInstance.get("characteristic/")
        .then((response) => {
            setCharacteristic(response.data);
        })
    }

    useEffect(() => {
        GetData();
    }, []);

    return (
        <div>
            <Box className="TopBar">
                <AddIcon />
                <Typography sx={{marginLeft:"15px"}} variant='subtitle1'>Create a new club</Typography>
            </Box>

            <Box className="FormBox">
                <Box className="FormArea">
                    <TextForm label="Name" />
                    <TextForm label="City" />
                    <SelectForm label="League" options={league} />

                    <Box sx={{marginTop:"40px"}}>
                        <Button variant="contained" fullWidth>SUBMIT DATA</Button>
                    </Box>
                </Box>
                
                <Box className="FormArea">
                    <SelectForm label="Country" options={country} />
                    <TextForm label="Attendance" />
                    <MultipleSelectForm label="Characteristics" options={characteristic} />
                </Box>

                <Box className="FormArea">
                    <DescriptionForm label="Description" rows={4} />
                </Box>

            </Box>
        </div>
    );
};

export default Create;