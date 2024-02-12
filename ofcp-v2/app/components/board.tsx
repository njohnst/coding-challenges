import { Button, Stack } from "@mui/material";
import styles from "./board.module.css";
import PrettyCard from "./card";
import { ControllerContext } from "../controller-provider";
import { useContext, useState } from "react";
import { GameState } from "../controller/controller";

export default function Board ({ board, draft, maxSize, player, disable } : { board: string[], draft: string[], maxSize: number, player: number, disable: boolean }) {
    const [controller, rerender] = useContext(ControllerContext);

    if (!controller) {
        throw new Error("Controller not found");
    }

    //check if player is in fantasyland and if we need to hide cards (i.e. it's not our turn anymore and we aren't in the scoring screen)
    const hide = controller.state != GameState.SCORING && controller.state != GameState.START && controller.players[player].nextHandFantasyCards > 0 && controller.current != player;

    return <Stack spacing={1} className={styles.board} alignItems='center'>
        {board.map((card, index) => (
            // rendered as a button for consistent styling... it's disabled though
            <Button disabled key={index}>
                <PrettyCard card={card} hidden={hide}/>
            </Button>
        ))}
        {draft.map((card, index) => (
            <Button
                key={index+board.length}
                disabled={disable || !!controller.selected}
                onClick={() => {
                    const temp = draft.splice(draft.findIndex(c => c == card),1);
                    //put the card back into hand...
                    controller.players[controller.current].hand.push(temp[0]);
                    rerender();
                }}
            >
                <PrettyCard card={card} />
            </Button>
        ))}
        {
            maxSize-board.length-draft.length > 0 ? Array.from(Array(maxSize-board.length-draft.length).keys()).map((index) => (
                <Button 
                    key={index+board.length+draft.length}
                    disabled={disable || !controller.selected}
                    onClick={() => {
                        if (controller.selected) {
                            draft.push(controller.selected);
                            //remove the card from player's hand
                            controller.players[controller.current].hand.splice(controller.players[controller.current].hand.findIndex(c => c == controller.selected),1);
                            controller.selected = '';
                            rerender();
                        }
                    }}
                >
                    <PrettyCard card='----' />
                </Button>
            )) : null
        }
    </Stack>;
};
