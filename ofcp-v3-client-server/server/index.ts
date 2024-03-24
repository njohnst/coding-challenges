import { Server } from 'socket.io';
import Controller, { GameState } from './controller/controller';
import Room from './room';
import Player from './controller/player';

const io = new Server({
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const rooms = {} as {[key: string]: Room};

io.on('connection', (socket) => {
  console.log("a user connected")
  
  socket.on('create-game', () => {
    console.log("creating game...");
    const roomId = (() => {
      for (let i = 0; i < 10; i++) {
        const roomId = Math.random().toString(36).substring(7); //generate a random alphanumeric string
        if (!rooms[roomId]) { //if the room doesn't already exist!
          return roomId;
        }
      }
      throw new Error('Failed to generate a unique room ID after 10 attempts'); //should basically never get here!
    })();

    //now, let's create the room and tell the client
    rooms[roomId] = new Room(roomId);
    socket.emit('create-game', roomId);

    //don't add him yet, let him join the room
  });

  socket.on('join-game', (roomId: string) => {
    if (!rooms[roomId]) {
      socket.emit('join-game', {success: false, message: 'Room does not exist!'});
      throw new Error('Room does not exist!');
    }

    //unable to join if already started
    if (rooms[roomId].gameStarted) {
      socket.emit('join-game', {success: false, message: 'Game has already started!'});
    }
    //unable to join if full (3 players)
    else if (rooms[roomId].clients.length >= 3) {
      socket.emit('join-game', {success: false, message: 'Room is full!'});
    }
    //otherwise, join the room
    else {
      console.log("joining game...");
  
      socket.emit('join-game', {success: true, message: 'Joined room!'});

      //add the player to the room and tell everyone in the room
      socket.join(roomId);
      rooms[roomId].addClient(socket);
      console.log("num players in room currently: " + rooms[roomId].clients.length)
      io.to(roomId).emit('lobby-clients', rooms[roomId].clients.length);
    }
  });
    

  socket.on('start-game', (roomId: string) => {
    if (!rooms[roomId]) {
      throw new Error('Room does not exist!');
    }

    if (rooms[roomId].gameStarted) {
      throw new Error('Game has already started!');
    }

    rooms[roomId].clientPlayerMap = rooms[roomId].clients.map((client) => client.id).reduce((acc, clientId, idx) => {
      acc[clientId] = "Player " + (idx+1);
      return acc;
    }, {} as {[key: string]: string});

    rooms[roomId].controller.startGame(Object.values(rooms[roomId].clientPlayerMap).map(name => new Player(name)));
    rooms[roomId].gameStarted = true;

    //tell each client individually what their player number is, and that the game has started
    rooms[roomId].clients.forEach((client) => {
      client.emit('game-started', Object.keys(rooms[roomId].clientPlayerMap).indexOf(client.id));
    });

    //tell all clients the game state
    const rCtrl = rooms[roomId].controller;
    io.to(roomId).emit('game-state', {  players: rCtrl.players, dealer: rCtrl.dealer, current: rCtrl.current, state: rCtrl.state });

    //set up the game listeners / wiring
    //TODO minimal validation right now...
    rooms[roomId].clients.forEach((client) => {    
      //game actions
      client.on('draw', () => {
        //check if this the current player and if they are allowed to draw
        if (rCtrl.current == Object.keys(rooms[roomId].clientPlayerMap).indexOf(client.id)
            && (rCtrl.state == GameState.FIRST_FIVE_DRAW || rCtrl.state == GameState.DRAW_THREE_DRAW || rCtrl.state == GameState.FANTASY_DRAW)) {
          rooms[roomId].controller.step();
          io.to(roomId).emit('game-state', {  players: rCtrl.players, dealer: rCtrl.dealer, current: rCtrl.current, state: rCtrl.state });
        }
      });

      client.on('next-hand', () => {
        //check if this the current player and if they are allowed to go next hand
        if (rCtrl.current == Object.keys(rooms[roomId].clientPlayerMap).indexOf(client.id)
            && rCtrl.state == GameState.START) {
          rooms[roomId].controller.step();
          io.to(roomId).emit('game-state', {  players: rCtrl.players, dealer: rCtrl.dealer, current: rCtrl.current, state: rCtrl.state });
        }
      });

      client.on('set-hand', (draftBack: string[], draftMiddle: string[], draftFront: string[]) => {
          //check if this the current player and if they are allowed to set
          if (rCtrl.current == Object.keys(rooms[roomId].clientPlayerMap).indexOf(client.id)
             && (rCtrl.state == GameState.FIRST_FIVE || rCtrl.state == GameState.DRAW_THREE || rCtrl.state == GameState.FANTASY)) {
            //TODO validate the draft...
            rCtrl.players[rCtrl.current].draftBack = draftBack;
            rCtrl.players[rCtrl.current].draftMiddle = draftMiddle;
            rCtrl.players[rCtrl.current].draftFront = draftFront;
            rCtrl.setCards();
            rooms[roomId].controller.step();
            io.to(roomId).emit('game-state', {  players: rCtrl.players, dealer: rCtrl.dealer, current: rCtrl.current, state: rCtrl.state });
          }
      });
    });
  });

  socket.on('disconnect', () => {
    //remove the client from all rooms
    Object.values(rooms).forEach(room => {
      room.removeClient(socket);
    });
  });

});

io.listen(3001);
