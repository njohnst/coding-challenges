import { Button, Grid, Paper, Stack } from "@mui/material";
import PrettyCard from "./card";
import { ControllerContext } from "../controller-provider";
import { useContext, useState } from "react";
import { GameState } from "../controller/controller";

export default function Actions ({ player } : { player: number }) {
    const [controller, rerender] = useContext(ControllerContext);

    if (!controller) {
        throw new Error("Controller not found");
    }

    //if we are in the draw three state or fantasy state, we must discard a card; otherwise no discard
    const discard = controller.state == GameState.DRAW_THREE || controller.state == GameState.FANTASY;

    //sort state
    const [bySuitSort, setBySuitSort] = useState(false);

    //if it's our turn, show the controls
    if (controller.current == player) {
        //if we haven't drawn yet:
        if (controller.state == GameState.FIRST_FIVE_DRAW || controller.state === GameState.DRAW_THREE_DRAW || controller.state === GameState.FANTASY_DRAW) {
            return (
                <Stack direction='row' spacing={0}>
                    <Paper>
                        <Button sx={{height: '100%'}} variant='contained' onClick={()=>{ controller.step(); rerender(); }}>Draw</Button>
                    </Paper>
                    {/* show an invisible blank card to make sure the bar doesn't resize */}
                    <Button disabled sx={{visibility: 'hidden'}}><PrettyCard card='----' /></Button>
                </Stack>
            );
        } else if (controller.state == GameState.START) {
            //else if we were the last one to act, show the next hand button
            //(for simplicity... it doesn't really matter which player has this button)
            return (
                <Stack direction='row' spacing={0}>
                    <Paper>
                        <Button sx={{height: '100%'}} variant='contained' onClick={()=>{ controller.step(); rerender(); }}>Next Hand</Button>
                    </Paper>
                    {/* show an invisible blank card to make sure the bar doesn't resize */}
                    <Button disabled sx={{visibility: 'hidden'}}><PrettyCard card='----' /></Button>
                </Stack>
            );

        } else {
            //otherwise, show our hand
            const cards = controller.players[player].hand;

            return (
                <Stack direction='row' spacing={0}>
                    <Paper>
                        <Grid container direction='row' justifyContent='flex-start' spacing={0} sx={{background:'inherit'}}>
                            <Grid item>
                                <Button size='small' sx={{height:'100%', width: '100%'}} onClick={()=> { controller.sortCurrentHand(bySuitSort); setBySuitSort(!bySuitSort); rerender();}} color='secondary' variant='outlined'>Sort</Button>
                            </Grid>
                            {cards.map((card: string, index: number) => (
                                <Grid item>
                                    <Button 
                                        key={index}
                                        disabled={(controller.selected && controller.selected != card) || (discard && cards.length == 1)}
                                        onClick={()=>{controller.selected = controller.selected ? '' : card; rerender();}}
                                    >
                                        <PrettyCard card={card} disabled={(controller.selected && controller.selected != card) || (discard && cards.length == 1)} />
                                    </Button>
                                </Grid>
                            ))}
                            <Grid item>
                                {/* show an invisible blank card to make sure the bar doesn't resize */}
                                <Button disabled sx={{visibility: 'hidden'}}><PrettyCard card='-' /></Button>
                                <Button  sx={{height:'100%'}} disabled={!(discard ? cards.length == 1 : cards.length < 1)} onClick={()=> { controller.step(); rerender();}} variant='contained'>Set</Button>
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
