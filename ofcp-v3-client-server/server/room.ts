import { Socket } from "socket.io";
import Controller from "./controller/controller";

export default class Room {
    clients: Socket[];
    gameStarted: boolean;
    identifier: string;
    controller: Controller;

    clientPlayerMap: {[key: string]: string};

    constructor(identifier: string) {
        this.clients = [];
        this.gameStarted = false;

        this.identifier = identifier;
        this.controller = new Controller();

        this.clientPlayerMap = {};
    }

    addClient(client: Socket) {
        this.clients.push(client);
    }

    removeClient(client: Socket) {
        this.clients = this.clients.filter(c => c !== client);
    }
};
