import React, { useState, useEffect } from "react";
import { Link, useHistory } from "react-router-dom";
import { Button, Grid, Typography, TextField, FormHelperText, FormControl, FormControlLabel, Radio, RadioGroup, Collapse } from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";

export default function CreateRoomPage(props) {

    let history = useHistory();

    const [guestCanPause, setGuestCanPause] = useState(props.guestCanPause);
    const [votesToSkip, setVotesToSkip] = useState(props.votesToSkip);
    const [successMsg, setSuccessMsg] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    const handleGuestCanPauseChange = (e) => {
        setGuestCanPause(e.target.value === "true" ? true : false);
    }

    const handleVotesChange = (e) => {
        setVotesToSkip(e.target.value);
    }

    const handleCreateRoomButtonPressed = () => {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' } ,
            body: JSON. stringify({
                guest_can_pause: guestCanPause,
                votes_to_skip: votesToSkip
            }),
        };

        fetch('/api/create-room', requestOptions)
            .then(response => response.json())
            .then(data =>
                history.push("/room/" + data.code)
            );
    }

    const renderCreateButtons = () => {
        return(
            <Grid container spacing={1}>
                <Grid item xs={12} align="center">
                    <Button 
                        color="primary" 
                        variant="contained"
                        onClick={handleCreateRoomButtonPressed}
                    >
                        Create
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

    const handleUpdateRoomButtonPressed = () => {
        const requestOptions = {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' } ,
            body: JSON. stringify({
                code: props.roomCode,
                guest_can_pause: guestCanPause,
                votes_to_skip: votesToSkip
            }),
        };

        fetch('/api/update-room', requestOptions)
            .then(response => {
                if(response.ok){
                    setSuccessMsg("Room updated successfully!")
                } else {
                    setErrorMsg("Error updating room.")
                }

            })
    }

    const renderUpdateButton = () => {
        return(
            <Grid item xs={12} align="center">
                <Button 
                    color="primary" 
                    variant="contained"
                    onClick={handleUpdateRoomButtonPressed}
                >
                    Update
                </Button>
            </Grid>
        )
    }

    return(
        <Grid container spacing={1}>
            <Grid item xs={12} align="center">
                <Collapse in={successMsg != ""} >
                    <Alert
                        severity="success"
                        onClose={() => {
                            setSuccessMsg("");
                        }}
                    >
                        {successMsg}
                    </Alert>
                </Collapse>
                <Collapse in={errorMsg != ""} >
                    <Alert
                        severity="error"
                        onClose={() => {
                            setErrorMsg("");
                        }}
                    >
                        {errorMsg}
                    </Alert>
                </Collapse>
            </Grid>
            <Grid item xs={12} align="center">
                <Typography component="h4" variant="h4">
                    {props.update ? 'Update Room' : 'Create A Room'}
                </Typography>
            </Grid>
            <Grid item xs={12} align="center">
                <FormControl component="fieldset">
                    <FormHelperText>
                        <div align="center">
                            Guest control of Playback State
                        </div>
                    </FormHelperText>
                    <RadioGroup row defaultValue={guestCanPause.toString()} onChange={handleGuestCanPauseChange}>
                        <FormControlLabel 
                            value="true" 
                            control={<Radio color="primary"/>}
                            label="Play/Pause"
                            labelPlacement="bottom"
                        />
                        <FormControlLabel 
                            value="false" 
                            control={<Radio color="secondary"/>}
                            label="No Control"
                            labelPlacement="bottom"
                        />
                    </RadioGroup>
                </FormControl>
            </Grid>
            <Grid item xs={12} align="center">
                <FormControl>
                    <TextField
                        required={true} 
                        type="number"
                        onChange={handleVotesChange}
                        defaultValue={votesToSkip}
                        inputProps={{
                            min: 1,
                            style: {textAlign: "center"}
                        }}
                    />
                    <FormHelperText>
                        <div align="center">
                            Votes Required To Skip Song
                        </div>
                    </FormHelperText>
                </FormControl>
            </Grid>
            {props.update ? renderUpdateButton() : renderCreateButtons()}
        </Grid>
    )
}

CreateRoomPage.defaultProps = {
    votesToSkip: 2,
    guestCanPause: true,
    update: false,
    roomCode: null
    
}
