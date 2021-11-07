import React, { useState, useEffect }from "react";
import { Grid, IconButton, Card, Typography, LinearProgress } from "@material-ui/core";
import CardMedia from '@mui/material/CardMedia';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import PauseIcon from "@material-ui/icons/Pause";
import SkipNextRoundedIcon from "@mui/icons-material/SkipNextRounded";
import SkipPreviousRoundedIcon from "@mui/icons-material/SkipPreviousRounded";

export default function MusicPlayer(props) {

    const songProgress = (props.time / props.duration) * 100;

    const pauseSong = () => {
        const requestOptions = {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
        };
        fetch("/spotify/pause-song", requestOptions);
    }
    
    const playSong = () => {
        const requestOptions = {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
        };
        fetch("/spotify/play-song", requestOptions);
    }

    const skipSong = () => {
        const requestOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
        };
        fetch("/spotify/skip-song", requestOptions);
    }

    return(
        <Card>
            <Grid container alignItems="center">
                <Grid item align="center" xs={12} md={4}>
                    <CardMedia
                        component="img"
                        image={props.image_url}
                    />
                </Grid>
                <Grid item align="center" xs={12} md={8}>
                    <Typography component="h5" variant="h5">
                    {props.title}
                    </Typography>
                    <Typography color="textSecondary" variant="subtitle1">
                    {props.artist}
                    </Typography>
                    <div>
                        <IconButton onClick={() => skipSong()}>
                            <SkipPreviousRoundedIcon fontSize="large"/>
                        </IconButton>
                        <IconButton
                            onClick={() => {
                                props.is_playing ? pauseSong() : playSong();
                            }}
                        >
                            {props.is_playing ? <PauseIcon fontSize="large"/> : <PlayArrowRoundedIcon fontSize="large"/>}
                        </IconButton>
                        <IconButton onClick={() => skipSong()}>
                            <SkipNextRoundedIcon fontSize="large"/>
                        </IconButton>
                    </div>
                </Grid>
            </Grid>
            <LinearProgress variant="determinate" value={songProgress} />
        </Card>
    )
}