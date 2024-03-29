'use client';
import { Avatar, Button, Stack } from '@mui/material';
import styles from './page.module.css';
import Grid from '@mui/material/Grid';
import Player from '@/server/controller/player';
import Board from '../../components/board';
import Actions from '../../components/actions';
import { useContext, useEffect, useRef, useState } from 'react';
import { SocketContext } from '@/app/socket-provider';
import PersonIcon from '@mui/icons-material/Person';
import { GameState } from '@/server/controller/controller';
import { rankOrder } from '@/server/controller/hand-evaluation';
import { useRouter } from 'next/navigation';

const DealerButton = () => {
  return <div className={styles.dealer}>
    &nbsp;D&nbsp;
  </div>;
};

export interface ClientState {
  players: Player[];
  dealer: number;
  current: number;
  state: GameState;
}

export default function Game({ params } : { params: {roomId: string}}) {
    const router = useRouter();
    const socket = useContext(SocketContext);
    
    //ref to prevent useEffect from running twice in dev mode
    const joinOnce = useRef(false);

    useEffect(() => {
      if (joinOnce.current) {
        return; //already joined
      }

      console.log("ATTEMPTING TO JOIN")
      joinOnce.current = true;

      socket?.emit('join-game', params.roomId);
      socket?.once('join-game', ({success, message} : {success: boolean, message: string}) => {
        console.log("JOINED")
        if (!success) {
          alert(message);
          router.push(`/`);
        }
      });
    }, []);

    const [numClients, setNumClients] = useState(0);
    const [isGameStarted, setIsGameStarted] = useState(false);
    const [gameState, setGameState] = useState({players: [], dealer: 0, current: 0, state: GameState.START} as ClientState);

    const [myPlayerNumber, setMyPlayerNumber] = useState(0);
    const [selected, setSelected] = useState('' as string);
    const [currentHand, setCurrentHand] = useState([] as string[]);

    const [draftFront, setDraftFront] = useState([] as string[]);
    const [draftMiddle, setDraftMiddle] = useState([] as string[]);
    const [draftBack, setDraftBack] = useState([] as string[]);

    const sortCurrentHand = (bySuit: boolean = false) => {
      if (bySuit) {
          //then sort by suit followed by rank
          currentHand.sort((a,b) => {
              return (a.charCodeAt(1) * 16 + rankOrder.indexOf(a[0])) - (b.charCodeAt(1) * 16 + rankOrder.indexOf(b[0]))
          });
      } else {
          //otherwise sort by just rank
          currentHand.sort((a,b) => {
              return rankOrder.indexOf(a[0]) - rankOrder.indexOf(b[0]);
          });
      }
    };

    socket?.on('lobby-clients', (numClients: number) => {
      setNumClients(numClients);
    });

    socket?.on('game-started', (myPlayerNumber: number) => {
      setIsGameStarted(true);
      setMyPlayerNumber(myPlayerNumber);
    });

    socket?.on('game-state', (data: ClientState) => {
      setGameState(data);

      if (data.current == myPlayerNumber) {
        //is it our turn?
        if (!currentHand.length) {
          //if we haven't already put the hand into array
          setCurrentHand(data.players[myPlayerNumber].hand);
        }
      } else {
        //set to empty, so that we avoid unsorting hands when it's our turn
        setCurrentHand([]);
        setDraftBack([]);
        setDraftMiddle([]);
        setDraftFront([]);
      }
    });

    const startGame = () => {
      console.log("starting game: " + params.roomId)
      socket?.emit('start-game', params.roomId);
    }

    if (!isGameStarted) {
      //game lobby
      return (
        <main className={styles.main}>
          <Grid container spacing={1}>
            <Grid item xs={12} className={styles.center}>
              <h1 className={styles.title}>
                Pineapple OFC
              </h1>
            </Grid>
            <Grid item xs={12}>
              <Stack spacing={3} className={styles.center}>
                <h2>Lobby: {params.roomId}</h2>
                <span>
                  <h3>Players: [{numClients}/3]</h3>
                  <ul>
                    <Avatar variant='rounded'><PersonIcon/></Avatar>
                    <Avatar variant='rounded' sx={{opacity: numClients >= 2 ? 1 : 0.2}}><PersonIcon/></Avatar>
                    <Avatar variant='rounded' sx={{opacity: numClients >= 3 ? 1 : 0.2}}><PersonIcon/></Avatar>
                  </ul>
                </span>
                <Button onClick={() => startGame()} disabled={numClients < 2} color='secondary' variant='contained'>Start!</Button>
              </Stack>
            </Grid>
          </Grid>
        </main>
      );
    } else {
      return (
        <main className={styles.main}>
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <h1 className={styles.title + ' ' + styles.center}>
                Pineapple OFC
              </h1>
            </Grid>
            {gameState.players.map((player, index) => ( 
              <Grid item xs={12/gameState.players.length} key={index} className={gameState.current == index ? styles.player + ' ' + styles.active : styles.player}>
                <Stack>
                  <h2 className={styles.center}>{player.name + (myPlayerNumber == index ? "(me)" : "")}{gameState.dealer == index && <>&nbsp;<DealerButton/></>}</h2>
                  <h3 className={styles.center}>Score: {player.score}</h3>
                  {myPlayerNumber == index ? <Stack direction='row' paddingBottom={1}>
                    <Actions gameState={gameState} selected={selected} setSelected={setSelected} draftBack={draftBack} draftMiddle={draftMiddle} draftFront={draftFront} currentHand={currentHand} sortCurrentHand={sortCurrentHand} player={index}/>
                  </Stack> : null}
                  <Grid container spacing={2}>
                    <Grid item xs={3}>
                      <Board gameState={gameState} selected={selected} setSelected={setSelected} currentHand={currentHand} setCurrentHand={setCurrentHand} board={player.back} setDraft={setDraftBack} draft={index == myPlayerNumber ? draftBack : []} maxSize={5} player={index} disable={gameState.current != index || myPlayerNumber != index}/>
                    </Grid>
                    <Grid item xs={3}>
                      <Board gameState={gameState} selected={selected} setSelected={setSelected} currentHand={currentHand} setCurrentHand={setCurrentHand} board={player.middle} setDraft={setDraftMiddle} draft={index == myPlayerNumber ? draftMiddle : []} maxSize={5} player={index} disable={gameState.current != index || myPlayerNumber != index}/>
                    </Grid>
                    <Grid item xs={3}>
                      <Board gameState={gameState} selected={selected} setSelected={setSelected} currentHand={currentHand} setCurrentHand={setCurrentHand} board={player.front} setDraft={setDraftFront} draft={index == myPlayerNumber ? draftFront : []} maxSize={3} player={index} disable={gameState.current != index || myPlayerNumber != index}/>
                    </Grid>
                  </Grid>
                </Stack>
              </Grid>
            ))}
          </Grid>
        </main>
      );
    }
    
}
