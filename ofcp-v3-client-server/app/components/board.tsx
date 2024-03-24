import { Button, Stack } from "@mui/material";
import styles from "./board.module.css";
import PrettyCard from "./card";
import { Dispatch, SetStateAction, } from "react";
import { GameState } from "@/server/controller/controller";
import { ClientState } from "../game/[roomId]/page";

export default function Board ({ gameState, selected, setSelected, currentHand, setCurrentHand, board, setDraft, draft, maxSize, player, disable } : { gameState: ClientState, selected: string, setSelected: Dispatch<SetStateAction<string>>, currentHand: string[], setCurrentHand: Dispatch<SetStateAction<Array<string>>>, board: string[], setDraft: Dispatch<SetStateAction<Array<string>>>,draft: string[], maxSize: number, player: number, disable: boolean }) {
    //check if player is in fantasyland and if we need to hide cards (i.e. it's not our turn anymore and we aren't in the scoring screen)
    const hide = gameState.state != GameState.SCORING && gameState.state != GameState.START && gameState.players[player].nextHandFantasyCards > 0 && gameState.current != player;

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
                disabled={disable || !!selected}
                onClick={() => {
                    const newDraft = draft.slice();
                    const temp = newDraft.splice(draft.findIndex(c => c == card),1);
                    //put the card back into hand...
                    const newHand = currentHand.slice();
                    newHand.push(temp[0]);
                    setCurrentHand(newHand);
                }}
            >
                <PrettyCard card={card} />
            </Button>
        ))}
        {
            maxSize-board.length-draft.length > 0 ? Array.from(Array(maxSize-board.length-draft.length).keys()).map((index) => (
                <Button 
                    key={index+board.length+draft.length}
                    disabled={disable || !selected}
                    onClick={() => {
                        if (selected) {
                            const newDraft = draft.slice();
                            newDraft.push(selected);
                            setDraft(newDraft);
                            //remove the card from player's hand
                            const newHand = currentHand.slice();
                            newHand.splice(gameState.players[gameState.current].hand.findIndex(c => c == selected),1);
                            setCurrentHand(newHand);
                            setSelected('');
                        }
                    }}
                >
                    <PrettyCard card='----' />
                </Button>
            )) : null
        }
    </Stack>;
};
