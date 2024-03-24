import { Server } from 'socket.io';
import Controller from './controller/controller';
import Room from './room';
import Player from './controller/player';
import { kMaxLength } from 'buffer';

const io = new Server({
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const rooms = {} as {[key: string]: Room};

io.on('connection', (socket) => {
  io.on('create-game', (_,callback) => {
    const roomId = (() => {
      for (let i = 0; i < 10; i++) {
        const roomId = Math.random().toString(36).substring(7); //generate a random alphanumeric string
        if (!rooms[roomId]) { //if the room doesn't already exist!
          return roomId;
        }
      }
      throw new Error('Failed to generate a unique room ID after 10 attempts'); //should basically never get here!
    })();

    //now, let's create the room and subscribe the client to that room
    rooms[roomId] = new Room(roomId);
    socket.join(roomId);
    callback(roomId);
  });

  io.on('join-game', (roomId: string, callback) => {
    if (!rooms[roomId]) {
      callback({success: false, message: 'Room does not exist!'});
      throw new Error('Room does not exist!');
    }

    //unable to join if already started
    if (rooms[roomId].gameStarted) {
      callback({success: false, message: 'Game has already started!'});
    }
    //unable to join if full (3 players)
    else if (rooms[roomId].clients.length >= 3) {
      callback({success: false, message: 'Room is full!'});
    }
    //otherwise, join the room
    else {
      rooms[roomId].addClient(socket);
      socket.join(roomId);
  
      callback({success: true, message: 'Joined room!'});
    }
  });
    

  io.on('start-game', (roomId: string) => {
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
  });

  io.on('disconnect', () => {
    //remove the client from all rooms
    Object.values(rooms).forEach(room => {
      room.removeClient(socket);
    });
  });

});

io.listen(3001);
