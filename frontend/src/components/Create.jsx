import {React, useState, useEffect} from "react";
import {Box, Typography} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import Button from '@mui/material/Button';
import {useFormik} from "formik";
import * as yup from "yup";
import {useNavigate} from "react-router";

import TextForm from "./forms/TextForm";
import SelectForm from "./forms/SelectForm";
import MultipleSelectForm from "./forms/MultiSelectForm";
import DescriptionForm from "./forms/DescriptionForm";
import MyMessage from "./forms/Message";
import AxiosInstance from "./Axios"; 

const Create = () => {
    const [country, setCountry] = useState([]);
    const [league, setLeague] = useState([]);
    const [characteristic, setCharacteristic] = useState([]);
    const [message, setMessage] = useState([]);
    const navigate = useNavigate();

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

    const validationSchema = yup.object({
        name: yup.string().required("Name is required"),
        description: yup.string().required("Description is required"),
        country: yup.string().required("Country is required"),
        league: yup.string().required("League is required"),
        attendance: yup.number("Must be a number").required("Attendance is required"),
        city: yup.string().required("City is required"),
        characteristic: yup.array().min(1, "At least one characteristic is required"),
    });

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
        validationSchema: validationSchema,
        onSubmit: (values) => {
            AxiosInstance.post("footballclub/", values)
            .then(() => {
                console.log("Data sent");
            }).then(() => {
                setMessage(
                    <MyMessage 
                        messageText="Data has been sent"
                        messageColor="green"
                    />
                )
                setTimeout(() => {
                    navigate("/");
                }, 2000);
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

 
                {message}

                <Box className="FormBox">
                    <Box className="FormArea">
                        <TextForm 
                            label={"Name"}
                            name ='name'
                            value={formik.values.name}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error = {formik.touched.name && Boolean(formik.errors.name)}
                            helperText = {formik.touched.name && formik.errors.name}
                        />
                        <TextForm label="City"
                            name ='city'
                            value={formik.values.city}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur} 
                            error = {formik.touched.city && Boolean(formik.errors.city)}
                            helperText = {formik.touched.city && formik.errors.city}
                        />
                        <SelectForm label="League"
                            options={league}
                            name ='league'
                            value={formik.values.league}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur} 
                            error = {formik.touched.league && Boolean(formik.errors.league)}
                            helperText = {formik.touched.league && formik.errors.league}
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
                            onBlur={formik.handleBlur}
                            error = {formik.touched.country && Boolean(formik.errors.country)}
                            helperText = {formik.touched.country && formik.errors.country}
                        />
                        <TextForm label="Attendance"
                            name ='attendance'
                            value={formik.values.attendance}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur} 
                            error = {formik.touched.attendance && Boolean(formik.errors.attendance)}
                            helperText = {formik.touched.attendance && formik.errors.attendance}
                        />
                        <MultipleSelectForm label="Characteristics"
                            options={characteristic}
                            name ='characteristic'
                            value={formik.values.characteristic}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur} 
                            error = {formik.touched.characteristic && Boolean(formik.errors.characteristic)}
                            helperText = {formik.touched.characteristic && formik.errors.characteristic}
                        />
                    </Box>

                    <Box className="FormArea">
                        <DescriptionForm label="Description"
                            rows={4}
                            name ='description'
                            value={formik.values.description}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error = {formik.touched.description && Boolean(formik.errors.description)}
                            helperText = {formik.touched.description && formik.errors.description}
                        />
                    </Box>

                </Box>
            </form>
        </div>
    );
};

export default Create;