import React, { useState } from "react";
import { TextField, Button, Grid, Typography } from "@material-ui/core";
import { Link, useHistory } from "react-router-dom";

export default function RoomJoinPage() {

    let history = useHistory();

    const [roomCode, setRoomCode] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    const handleTextFieldChange = (e) => {
        setRoomCode(e.target.value);
    }

    const handleJoinRoomButtonPressed = () => {
        fetch('/api/get-room?code=' + roomCode)
            .then(response => {
                if(response.ok) {
                    history.push("/room/" + roomCode)
                } else {
                    setErrorMsg("Room not found.")
                }
            }
        ).catch(error => {
            console.log(error);
        })
    }

    return(
        <Grid container spacing={1}>
            <Grid item xs={12} align="center">
                <Typography component="h4" variant="h4">
                    Join A Room
                </Typography>
            </Grid>
            <Grid item xs={12} align="center">
                <TextField
                    error={errorMsg}
                    label="Code"
                    placeholder="Enter a Room Code"
                    value={roomCode}
                    helperText={errorMsg}
                    variant="outlined"
                    onChange={handleTextFieldChange}
                />  
            </Grid>
            <Grid item xs={12} align="center">
                <Button 
                    color="primary" 
                    variant="contained"
                    onClick={handleJoinRoomButtonPressed}
                >
                    Enter Room
                </Button>
            </Grid>
            <Grid item xs={12} align="center">
                <Button color="secondary" variant="contained" to="/" component={Link}>
                    Back
                </Button>
            </Grid>
        </Grid>
    )
}