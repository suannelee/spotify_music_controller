import React, { useState, useEffect }from "react";
import { Grid, Button, Typography } from "@material-ui/core";
import { useHistory } from "react-router-dom";
import CreateRoomPage from "./CreateRoomPage";

export default function Room(props) {
    const defaultVotes = 2;
    const roomCode = props.match.params.roomCode;
    let history = useHistory();

    const [isHost, setIsHost] = useState(false);
    const [guestCanPause, setGuestCanPause] = useState(true);
    const [votesToSkip, setVotesToSkip] = useState(defaultVotes);
    const [showSettings, setShowSettings] = useState(false);


    const getRoomDetails = () => {
        fetch('/api/get-room?code=' + roomCode)
            .then(response => {
                if (!response.ok) {
                    props.leaveRoomCallback();
                    history.push('/');
                }
                return response.json();
            })
            .then(data => {

                setIsHost(data.is_host),
                setGuestCanPause(data.guest_can_pause),
                setVotesToSkip(data.votes_to_skip)
            }
        )
    }

    getRoomDetails();

    const handleLeaveRoomButtonPressed = () => {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' } 
        };

        fetch('/api/leave-room', requestOptions)
            .then(response =>  {
                props.leaveRoomCallback()
                history.push('/');
            }
        )
    }

    const updateShowSettings = (value) => {
        setShowSettings(value);
    }

    const renderSettingsButton = () => {
        return(
            <Grid item xs={12} align="center">
                <Button 
                    color="primary" 
                    variant="contained"
                    onClick={() => updateShowSettings(true)}
                >
                    Settings
                </Button>
            </Grid>
        )
    }

    const renderSettings = () => {
        return(
            <Grid container spacing={1}>
                <Grid item xs={12} align="center">
                    <CreateRoomPage 
                        update={true} 
                        roomCode={roomCode}
                        guestCanPause={guestCanPause}
                        votesToSkip={votesToSkip}
                    />
                </Grid>
                <Grid item xs={12} align="center">
                    <Button 
                        color="secondary" 
                        variant="contained"
                        onClick={() => updateShowSettings(false)}
                    >
                        Close
                    </Button>
                </Grid>
            </Grid>
        )
    }

    if (showSettings) {
        return renderSettings();
    }

    return(
        <Grid container spacing={1}>
            <Grid item xs={12} align="center">
                <Typography variant="h4" component="h4">
                    {roomCode}
                </Typography>
            </Grid>
            <Grid item xs={12} align="center"> 
                <Typography variant="p" component="p">
                    Host: {isHost.toString()}
                </Typography>
            </Grid>
            <Grid item xs={12} align="center">
                <Typography variant="p" component="p">
                    Guest Can Pause: {guestCanPause.toString()}
                </Typography>
            </Grid>
            <Grid item xs={12} align="center">
                <Typography variant="p" component="p">
                    Votes To Skip: {votesToSkip}
                </Typography>
            </Grid>
            {isHost ? renderSettingsButton() : null}
            <Grid item xs={12} align="center">
                <Button 
                    color="secondary" 
                    variant="contained"
                    onClick={handleLeaveRoomButtonPressed}
                >
                    {isHost ? 'Close Room' : 'Leave Room'}
                </Button>
            </Grid>
       </Grid>
    )
}