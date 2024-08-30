import React, { useEffect, useState } from 'react';
import axios from 'axios';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';





function formatTimeInUserTimezone(rideTime, userTimezone) {
    const date = new Date(rideTime);
    const options = {
        timeZone: userTimezone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    };
    const formatter = new Intl.DateTimeFormat([], options);
    const [formattedTime] = formatter.format(date).split(' ');
    
    return formattedTime;
}

const RideList = () => {
    const [rides, setRides] = useState([]);
    const [loading, setLoading] = useState(true);
    const apiUrl = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchRides = async () => {
            try {
                const response = await axios.get(`${apiUrl}/rides`);
                setRides(response.data);
            } catch (error) {
                console.error("Error fetching rides", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRides();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <CircularProgress />
            </div>
        );
    }

    return (
        <div className="flex justify-center items-center">
            <div className="w-2p max-w-md h-full max-h-md w-[80vw]">
                <Typography variant="h4" component="h1" align="center" gutterBottom>
                    Available Rides
                </Typography>
                <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                    {rides.map((ride, index) => (
                        <React.Fragment key={ride.host}>
                            <ListItem alignItems="flex-start">
                                <ListItemText
                                    sx={{color:'black'}}
                                    primary={`${ride.host}`}
                                    secondary={
                                        <React.Fragment>
                                            <Typography
                                                component="span"
                                                variant="body2"
                                                sx={{ color: 'black', display: 'inline' }}
                                            >
                                                {`${ride.pickup} to ${ride.destination} `}
                                            </Typography>
                                            <br/>
                                            {`At ${formatTimeInUserTimezone(ride.time)}`}
                                            <br/>
                                            {`Contact ${ride.phone_no}`}
                                            
                                        </React.Fragment>
                                    }
                                />
                            </ListItem>
                            {index < rides.length - 1 && <Divider variant="inset" component="li" />}
                        </React.Fragment>
                    ))}
                </List>
            </div>
        </div>
    );
};

export default RideList;
