'use client';
import { useContext, useState } from 'react';
import { SocketContext } from './socket-provider';
import { Button, Stack, TextField } from '@mui/material';
import styles from './page.module.css';
import Grid from '@mui/material/Grid';
import { useRouter } from 'next/navigation';


export default function Home() {
  const router = useRouter();
  const socket = useContext(SocketContext);

  const [roomId, setRoomId] = useState('' as string);

  if (!socket) {
    throw new Error("Not connected to server!");
  }

  const createGame = () => {
    console.log("trying to create")
    socket.emit('create-game', roomId);
    socket.once('create-game', (roomId) => {
      console.log("created successfully, rerouting to game page")
      router.push(`/game/${roomId}`);
    });
  };

  const joinGame = (roomId: string) => {
    router.push(`/game/${roomId}`);
  };
  
  //join or create
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
            <Button onClick={() => createGame()} color='secondary' variant='contained'>Create Game</Button>
            <span>
              <TextField id="room-id" label="Room ID" value={roomId} onChange={(ev) => setRoomId(ev.target.value)}/>
              <Button onClick={()=> joinGame(roomId)} variant='contained'>Join Game</Button>
            </span>
          </Stack>
        </Grid>
      </Grid>
    </main>
  );
}


