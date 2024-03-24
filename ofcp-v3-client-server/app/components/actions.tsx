import { Button, Grid, Paper, Stack } from "@mui/material";
import PrettyCard from "./card";
import { SocketContext } from "../socket-provider";
import { Dispatch, SetStateAction, useContext, useState } from "react";
import { ClientState } from "../game/[roomId]/page";
import { GameState } from "@/server/controller/controller";

export default function Actions ({ gameState, selected, setSelected, currentHand, draftBack, draftMiddle, draftFront, sortCurrentHand, player } : { gameState: ClientState, selected: string, setSelected: Dispatch<SetStateAction<string>>, currentHand: string[], draftBack: string[], draftMiddle: string[], draftFront: string[], sortCurrentHand: (bySuitSort: boolean)=>void, player: number }) {
    const socket = useContext(SocketContext);

    if (!socket) {
        throw new Error("Not connected to server!");
    }

    //if we are in the draw three state or fantasy state, we must discard a card; otherwise no discard
    const discard = gameState.state == GameState.DRAW_THREE || gameState.state == GameState.FANTASY;

    //sort state
    const [bySuitSort, setBySuitSort] = useState(false);

    //if it's our turn, show the controls
    if (gameState.current == player) {
        //if we haven't drawn yet:
        if (gameState.state == GameState.FIRST_FIVE_DRAW || gameState.state === GameState.DRAW_THREE_DRAW || gameState.state === GameState.FANTASY_DRAW) {
            return (
                <Stack direction='row' spacing={0}>
                    <Paper>
                        <Button sx={{height: '100%'}} variant='contained' onClick={()=>{ socket.emit('draw'); }}>Draw</Button>
                    </Paper>
                    {/* show an invisible blank card to make sure the bar doesn't resize */}
                    <Button disabled sx={{visibility: 'hidden'}}><PrettyCard card='----' /></Button>
                </Stack>
            );
        } else if (gameState.state == GameState.START) {
            //else if we were the last one to act, show the next hand button
            //(for simplicity... it doesn't really matter which player has this button)
            return (
                <Stack direction='row' spacing={0}>
                    <Paper>
                        <Button sx={{height: '100%'}} variant='contained' onClick={()=>{ socket.emit('next-hand'); }}>Next Hand</Button>
                    </Paper>
                    {/* show an invisible blank card to make sure the bar doesn't resize */}
                    <Button disabled sx={{visibility: 'hidden'}}><PrettyCard card='----' /></Button>
                </Stack>
            );

        } else {
            //otherwise, show our hand
            const cards = currentHand;

            return (
                <Stack direction='row' spacing={0}>
                    <Paper>
                        <Grid container direction='row' justifyContent='flex-start' spacing={0} sx={{background:'inherit'}}>
                            <Grid item>
                                <Button size='small' sx={{height:'100%', width: '100%'}} onClick={()=> { sortCurrentHand(bySuitSort); setBySuitSort(!bySuitSort); }} color='secondary' variant='outlined'>Sort</Button>
                            </Grid>
                            {cards.map((card: string, index: number) => (
                                <Grid item>
                                    <Button 
                                        key={index}
                                        disabled={(selected && selected != card) || (discard && cards.length == 1)}
                                        onClick={()=>{ setSelected(selected ? '' : card); }}
                                    >
                                        <PrettyCard card={card} disabled={(selected && selected != card) || (discard && cards.length == 1)} />
                                    </Button>
                                </Grid>
                            ))}
                            <Grid item>
                                {/* show an invisible blank card to make sure the bar doesn't resize */}
                                <Button disabled sx={{visibility: 'hidden'}}><PrettyCard card='-' /></Button>
                                <Button  sx={{height:'100%'}} disabled={!(discard ? cards.length == 1 : cards.length < 1)} onClick={()=> { socket.emit('set-hand', {draftBack: draftBack, draftMiddle: draftMiddle, draftFront: draftFront,}); }} variant='contained'>Set</Button>
                            </Grid>
                        </Grid>
                    </Paper>
                    {/* show an invisible blank card to make sure the bar doesn't resize */}
                    <Button disabled sx={{visibility: 'hidden'}}><PrettyCard card='----' /></Button>
                </Stack>
            );
        }
    } else {
        //it's not our turn, show a blank bar to keep the page from jumping around
        return <Paper sx={{visibility:'hidden'}}>
            <Button disabled><PrettyCard card='----' /></Button>
        </Paper>
    }
};
