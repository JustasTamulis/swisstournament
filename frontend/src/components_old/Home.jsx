import {React, useEffect, useMemo,useState} from 'react'
import {Box, Chip, Typography} from '@mui/material'
import CalendarViewMonthIcon from '@mui/icons-material/CalendarViewMonth';
import {MaterialReactTable} from 'material-react-table';
import {useSearchParams} from 'react-router';
import AxiosInstance from './Axios';


const Home = () =>{

    const [myData, setMyData] = useState([])
    const [searchParams] = useSearchParams();

    // Read query parameters
    useEffect(() => {
        // Log all query parameters
        console.log("Query Parameters:");
        for (const [key, value] of searchParams.entries()) {
            console.log(`${key}: ${value}`);
        }
    }, [searchParams]);

    const GetData = () =>{
        AxiosInstance.get(`footballclub/`).then((res) =>{
            setMyData(res.data)
        } )
    }

    useEffect(() =>{
        GetData()
    },[])

    const columns = useMemo(
        () => [
            {
                accessorKey:'name',
                header: 'Name'
            }, 
            {
                accessorKey:'country_details.name',
                header: 'Country'
            },
            {
                accessorKey:'league_details.name',
                header: 'League'
            },
            {
                accessorKey:'city',
                header: 'City'
            },
            {
                accessorKey:'attendance',
                header: 'Attendance'
            },
            {
                accessorKey:'characteristic_names',
                header: 'Characteristics',
                Cell: ({cell}) =>(
                    <div style={{display:'flex', gap:'8px', flexWrap:'wrap'}}>
                            {
                                cell.getValue()?.map((char,index) =>(
                                    <Chip key={index} label={char}/>
                                ))
                            }

                    </div>
                )
            }


        ]
    )

    return(
        <div>
            <Box className={"TopBar"}>
                <CalendarViewMonthIcon/>
                <Typography sx={{marginLeft:'15px', fontWeight:'bold'}} variant='subtitle2'>View all clubs!</Typography>
            </Box>

            <MaterialReactTable
                columns={columns}
                data={myData}

            />
        </div>
    )
}

export default Home