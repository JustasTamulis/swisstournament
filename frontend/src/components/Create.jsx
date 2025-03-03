import {React, useState, useEffect} from "react";
import AxiosInstance from "./Axios"; 
import {Box, Typography} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import Button from '@mui/material/Button';
import {useFormik} from "formik";

import TextForm from "./forms/TextForm";
import SelectForm from "./forms/SelectForm";
import MultipleSelectForm from "./forms/MultiSelectForm";
import DescriptionForm from "./forms/DescriptionForm";
import { Axios } from "axios";

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

    const formik = useFormik({
        initialValues: {
            name: 'zalgiris',
            description: '',
            country: '',
            league: '',
            attendance: '',
            city: '',
            characteristic: [],
        },
        onSubmit: (values) => {
            AxiosInstance.post("footballclub/", values)
            .then(() => {
                console.log("Data sent");
            })
        }
    });

    console.log("formik values", formik.values);

    return (
        <div>
            <form onSubmit={formik.handleSubmit}>
                <Box className="TopBar">
                    <AddIcon />
                    <Typography sx={{marginLeft:"15px"}} variant='subtitle1'>Create a new club</Typography>
                </Box>

                <Box className="FormBox">
                    <Box className="FormArea">
                        <TextForm 
                            label={"Name"}
                            name ='name'
                            value={formik.values.name}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                        />
                        <TextForm label="City"
                            name ='city'
                            value={formik.values.city}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur} 
                        />
                        <SelectForm label="League"
                            options={league}
                            name ='league'
                            value={formik.values.league}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur} 
                        />

                        <Box sx={{marginTop:"40px"}}>
                            <Button type="submit" variant="contained" fullWidth>
                                SUBMIT DATA
                            </Button>
                        </Box>
                    </Box>
                    
                    <Box className="FormArea">
                        <SelectForm label="Country"
                            options={country}
                            name ='country'
                            value={formik.values.country}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}/>
                        <TextForm label="Attendance"
                            name ='attendance'
                            value={formik.values.attendance}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur} 
                        />
                        <MultipleSelectForm label="Characteristics"
                            options={characteristic}
                            name ='characteristic'
                            value={formik.values.characteristic}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur} 
                        />
                    </Box>

                    <Box className="FormArea">
                        <DescriptionForm label="Description"
                            rows={4}
                            name ='description'
                            value={formik.values.description}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                        />
                    </Box>

                </Box>
            </form>
        </div>
    );
};

export default Create;