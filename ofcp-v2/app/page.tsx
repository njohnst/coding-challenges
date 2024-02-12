'use client';
import { Button, Stack } from '@mui/material';
import styles from './page.module.css';
import Grid from '@mui/material/Grid';
import { useContext, useState } from 'react';
import { ControllerContext } from './controller-provider';
import Player from './controller/player';
import Board from './components/board';
import Actions from './components/actions';

const DealerButton = () => {
  return <div className={styles.dealer}>
    &nbsp;D&nbsp;
  </div>;
};

export default function Game() {
  const [players, setPlayers] = useState(2);
  const [gameStarted, setGameStarted] = useState(false);

  const [controller, rerender] = useContext(ControllerContext);

  if (!controller) {
    throw new Error("Controller not found");
  }
  
  const startGame = () => {
    controller.startGame(Array.from(Array(players).keys()).map(player => new Player("Player " + (Number(player)+1))));
    setGameStarted(true);
    rerender();
  };

  //game settings screen
  if (!gameStarted) {
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
              <h2>Settings</h2>
              <span>Select Number of Players: &nbsp;&nbsp;&nbsp;
                <Button onClick={()=>setPlayers(2)} variant={players == 2 ? 'contained' : 'outlined'}>2</Button>
                <Button onClick={()=>setPlayers(3)} variant={players == 3 ? 'contained' : 'outlined'}>3</Button>
              </span>
              <Button onClick={() => startGame()} color='secondary' variant='contained'>Start!</Button>
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
          {controller.players.map((player, index) => ( 
            <Grid item xs={12/controller.players.length} key={index} className={controller.current == index ? styles.player + ' ' + styles.active : styles.player}>
              <Stack>
                <h2 className={styles.center}>{player.name}{controller.dealer == index && <>&nbsp;<DealerButton/></>}</h2>
                <h3 className={styles.center}>Score: {player.score}</h3>
                <Stack direction='row' paddingBottom={1}>
                  <Actions player={index}/>
                </Stack>
                <Grid container spacing={2}>
                  <Grid item xs={3}>
                    <Board board={player.back} draft={player.draftBack} maxSize={5} player={index} disable={controller.current != index}/>
                  </Grid>
                  <Grid item xs={3}>
                    <Board board={player.middle} draft={player.draftMiddle} maxSize={5} player={index} disable={controller.current != index}/>
                  </Grid>
                  <Grid item xs={3}>
                    <Board board={player.front} draft={player.draftFront} maxSize={3} player={index} disable={controller.current != index}/>
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

