import React, { useState, useEffect }from "react";

export default function Room(props) {
    const defaultVotes = 2;
    const roomCode = props.match.params.roomCode;

    const [isHost, setIsHost] = useState(false);
    const [guestCanPause, setGuestCanPause] = useState(true);
    const [votesToSkip, setVotesToSkip] = useState(defaultVotes);

    const getRoomDetails = () => {
        fetch('/api/get-room?code=' + roomCode)
            .then(response => response.json())
            .then(data => {

                setIsHost(data.is_host),
                setGuestCanPause(data.guest_can_pause),
                setVotesToSkip(data.votes_to_skip)
            }
        )
    }

    getRoomDetails();

    return(
        <div>
            <h1>{roomCode}</h1>
            <p>Host: {isHost.toString()}</p>
            <p>Guest Can Pause: {guestCanPause.toString()}</p>
            <p>Votes To Skip: {votesToSkip}</p>
        </div>
    )
}