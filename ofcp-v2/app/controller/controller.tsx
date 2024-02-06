'use client';

import { HandClass, evaluate3CardHand, evaluate5CardHand, isBust, isFantasy } from "./hand-evaluation";
import Player from "./player";
import calculateRoyalties from "./royalties";

const defaultDeck52 = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'].flatMap((rank) => {
    return ['c', 'd', 'h', 's'].map((suit) => {
        return rank + suit;
    });
});

export enum GameState {
    START,
    FIRST_FIVE_DRAW,
    FIRST_FIVE,
    DRAW_THREE_DRAW,
    DRAW_THREE,
    FANTASY,
    SCORING,
};

export default class Controller {
    state: GameState = GameState.START;
    deck: string[] = [];
    players: Player[] = [];
    dealer: number = -1; //index into players
    current: number = -1; //index into players
    selected: string = ""; //selected card

    startGame(players: Player[]) {
        this.players = players;
        this.state = GameState.START;

        this.step();
    }

    shuffle() {
        const len = this.deck.length;

        // Fisher-Yates shuffle
        // https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
        for (let i = 0; i < len; i++) {
            const j = i+Math.floor(Math.random() * len-i-1);
            const temp = this.deck[i];
            this.deck[i] = this.deck[j];
            this.deck[j] = temp;
        }
    }

    setCards() {
        this.players[this.current].setFront(this.players[this.current].getFront().concat(this.players[this.current].getDraftFront()));
        this.players[this.current].setMiddle(this.players[this.current].getMiddle().concat(this.players[this.current].getDraftMiddle()));
        this.players[this.current].setBack(this.players[this.current].getBack().concat(this.players[this.current].getDraftBack()));

        this.players[this.current].draftFront = [];
        this.players[this.current].draftMiddle = [];
        this.players[this.current].draftBack = [];

        this.players[this.current].hand = [];
    }

    updateScore() {
        const playersReduced = this.players.reduce((prev, player: Player) => {
            const front = player.getFront();
            const middle = player.getMiddle();
            const back = player.getBack();

            //get [handClass,strength]
            const [frontClass, frontStrength] = evaluate3CardHand(front);
            const [middleClass, middleStrength] = evaluate5CardHand(middle);
            const [backClass, backStrength] = evaluate5CardHand(back);

            //royalties
            const royalties = calculateRoyalties([frontClass,frontStrength],[middleClass,middleStrength],[backClass,backStrength]);

            prev.push({
                player,
                front: [frontClass,frontStrength],
                middle: [middleClass,middleStrength],
                back: [backClass,backStrength],
                royalties,
                isBust: isBust([frontClass,frontStrength], [middleClass,middleStrength], [backClass,backStrength]),
                isFantasy: isFantasy([frontClass,frontStrength])
            });
            return prev;
        }, [] as {player: Player, front: [HandClass, number], middle: [HandClass, number], back: [HandClass, number], royalties: number, isBust: boolean, isFantasy: boolean}[]);

        //now, map over it and do comparison
        playersReduced.forEach(({player, front, middle, back, royalties, isBust, isFantasy}) => {
            playersReduced.forEach(({front: otherFront, middle: otherMiddle, back: otherBack, royalties: otherRoyalties, isBust: otherBust}) => {
                if (isBust && !otherBust) {
                    player.score -= 6;
                } else if (!isBust) {
                    if (otherBust) {
                        player.score += 6;
                    } else {
                        if (front[0] > otherFront[0] || (front[0] === otherFront[0] && front[1] > otherFront[1])) {
                            player.score += 1;
                        } else { 
                            player.score -= 1;
                        }

                        if (middle[0] > otherMiddle[0] || (middle[0] === otherMiddle[0] && middle[1] > otherMiddle[1])) {
                            player.score += 1;
                        } else {
                            player.score -= 1;
                        }

                        if (back[0] > otherBack[0] || (back[0] === otherBack[0] && back[1] > otherBack[1])) {
                            player.score += 1;
                        } else {
                            player.score -= 1;
                        }
                    }

                    //add royalties
                    player.score += royalties - otherRoyalties;
                }
            });
        });
    }

    step() {
        switch(this.state) {
            case GameState.START:
                this.deck = defaultDeck52.slice(); //copy the default 52 card deck
                this.shuffle();

                //clean all of the boards and hands
                this.players.forEach(player => {
                    player.setHand([]);
                    player.setFront([]);
                    player.setMiddle([]);
                    player.setBack([]);
                    player.draftFront = [];
                    player.draftMiddle = [];
                    player.draftBack = [];
                });

                //if its the first round, select a dealer
                if (this.dealer < 0) {
                    this.dealer = Math.floor(Math.random() * this.players.length);
                } else {
                    this.dealer = (this.dealer + 1) % this.players.length;
                }

                //set to the first player's turn
                this.current = (this.dealer + 1) % this.players.length;

                //check if any players are waiting for fantasy
                if (0) { //TODO!
                    this.state = GameState.FANTASY;
                } else {
                    this.state = GameState.FIRST_FIVE_DRAW;
                }
                break;
        
            case GameState.FANTASY:
                //TODO!
                break;

            case GameState.FIRST_FIVE_DRAW:
                if (this.deck.length < 5) {
                    throw new Error("Not enough cards in the deck, something went wrong!");
                }

                //draw 5 for the player!
                this.players[this.current].setHand(this.deck.splice(0, 5));

                //go to the the next phase
                this.state = GameState.FIRST_FIVE;

                break;

            case GameState.FIRST_FIVE:
                this.setCards();

                if (this.current === this.dealer) {
                    this.state = GameState.DRAW_THREE_DRAW;
                    this.current = (this.current + 1) % this.players.length;
                } else {
                    this.state = GameState.FIRST_FIVE_DRAW;
                    this.current = (this.current + 1) % this.players.length;
                }
                break;

            case GameState.DRAW_THREE_DRAW:
                if (this.deck.length < 3) {
                    throw new Error("Not enough cards in the deck, something went wrong!");
                }

                //draw 3 for the player!
                this.players[this.current].setHand(this.deck.splice(0, 3));

                //go to the the next phase
                this.state = GameState.DRAW_THREE;

                break;

            case GameState.DRAW_THREE:
                this.setCards();

                if (this.players.filter(player => player.getFront().length == 3 && player.getMiddle().length == 5 && player.getBack().length == 5).length === this.players.length){
                    this.state = GameState.SCORING;
                    this.step();
                } else {
                    this.state = GameState.DRAW_THREE_DRAW;
                    this.current = (this.current + 1) % this.players.length;
                }
                break;

            case GameState.SCORING:
                this.updateScore();
                this.state = GameState.START;
                break;
        }
    }
};
