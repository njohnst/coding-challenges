import { HandClass, evaluate3CardHand, evaluate5CardHand, isBust, isFantasy, rankOrder } from "./hand-evaluation";
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
    FANTASY_DRAW,
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
            const j = i+Math.floor(Math.random() * (len-i-1));
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

            //console.log(frontClass, frontStrength, middleClass, middleStrength, backClass, backStrength, royalties);

            prev.push({
                player,
                front: [frontClass,frontStrength],
                middle: [middleClass,middleStrength],
                back: [backClass,backStrength],
                royalties,
                isBust: isBust([frontClass,frontStrength], [middleClass,middleStrength], [backClass,backStrength]),
                isFantasy: isFantasy([frontClass,frontStrength],[backClass,backStrength],player.nextHandFantasyCards > 0)
            });
            return prev;
        }, [] as {player: Player, front: [HandClass, number], middle: [HandClass, number], back: [HandClass, number], royalties: number, isBust: boolean, isFantasy: boolean}[]);

        //now, map over it and do comparison
        playersReduced.forEach(({player, front, middle, back, royalties, isBust, isFantasy}) => {
            playersReduced.forEach(({player: otherPlayer, front: otherFront, middle: otherMiddle, back: otherBack, royalties: otherRoyalties, isBust: otherBust}) => {
                //skip if it's the same player!
                if (player === otherPlayer) {
                    return;
                }

                if (isBust && !otherBust) {
                    player.score -= 6;
                    player.score -= otherRoyalties;
                } else if (!isBust) {
                    if (otherBust) {
                        player.score += 6;
                    } else {
                        let tempScore = 0;

                        if (front[0] > otherFront[0] || (front[0] === otherFront[0] && front[1] > otherFront[1])) {
                            tempScore += 1;
                        } else { 
                            tempScore -= 1;
                        }

                        if (middle[0] > otherMiddle[0] || (middle[0] === otherMiddle[0] && middle[1] > otherMiddle[1])) {
                            tempScore += 1;
                        } else {
                            tempScore -= 1;
                        }

                        if (back[0] > otherBack[0] || (back[0] === otherBack[0] && back[1] > otherBack[1])) {
                            tempScore += 1;
                        } else {
                            tempScore -= 1;
                        }

                        //scoop detection
                        if (tempScore == 3) {
                            //we scooped
                            player.score += 6;
                        } else if (tempScore == -3) {
                            //we got scooped
                            player.score -= 6;
                        } else {
                            player.score += tempScore;
                        }
                    }

                    //add royalties
                    player.score += royalties - (!otherBust ? otherRoyalties : 0);

                    //fantasy detection
                    if (isFantasy && !isBust) {
                        //we got fantasy for next hand!
                        player.nextHandFantasyCards = 14;
                    } else {
                        player.nextHandFantasyCards = 0;
                    }
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

                //check if any players are waiting for fantasy
                const playersIndicesAwaitingFantasy = this.players.map((_, idx) => idx).filter((player: number) => this.players[player].nextHandFantasyCards > 0);
                if (playersIndicesAwaitingFantasy.length > 0) {
                    this.current = playersIndicesAwaitingFantasy[0];
                    this.state = GameState.FANTASY_DRAW;
                } else {
                    //set to the first player's turn
                    this.current = (this.dealer + 1) % this.players.length;
                    this.state = GameState.FIRST_FIVE_DRAW;
                }
                break;
        
            case GameState.FANTASY_DRAW:
                if (this.deck.length < 14) {
                    throw new Error("Not enough cards in the deck, something went wrong!");
                }

                //TODO possibly allow more than 14 cards for fantasy for some variants
                //draw 14 for the player!
                this.players[this.current].setHand(this.deck.splice(0, 14));

                //go to the the next phase
                this.state = GameState.FANTASY;

                break;

            case GameState.FANTASY:
                this.setCards();

                this.current = (this.current + 1) % this.players.length;

                //go to the the next phase
                //if next player is waiting for fantasy, then stay in fantasy state
                if (this.players[this.current].nextHandFantasyCards > 0 && this.players[this.current].front.length < 3) {
                    this.state = GameState.FANTASY_DRAW;
                } else if (this.players[this.current].nextHandFantasyCards > 0 && this.players[this.current].front.length == 3) {
                    //else if the next player already set their fantasy, then we are done, let's go to scoring
                    this.state = GameState.SCORING;
                    this.step();
                } else {
                    //otherwise, go to next
                    this.state = GameState.FIRST_FIVE_DRAW;
                }

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
                    //then let's go to draw three
                    this.state = GameState.DRAW_THREE_DRAW;

                    //advance to the next player
                    this.current = (this.current + 1) % this.players.length;

                    //skip to the next non-fantasy player
                    while (this.players[this.current].nextHandFantasyCards > 0) {
                        this.current = (this.current + 1) % this.players.length;
                    }
                } else {
                    //set the state to draw 5
                    //but we may change it in the loop...
                    this.state = GameState.FIRST_FIVE_DRAW;

                    //advance to the next player
                    this.current = (this.current + 1) % this.players.length;

                    //otherwise, let's check if there are any non-fantasy players remaining
                    while (this.players[this.current].nextHandFantasyCards > 0) {
                        //check if we've passed the dealer yet
                        if (this.current === this.dealer) {
                            this.state = GameState.DRAW_THREE_DRAW;
                        }
                        this.current = (this.current + 1) % this.players.length;
                    }
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

                //skip over any players in fantasy...
                while (this.players[this.current].nextHandFantasyCards > 0) {
                    this.current = (this.current + 1) % this.players.length;
                }

                if (this.players.filter(player => player.getFront().length == 3 && player.getMiddle().length == 5 && player.getBack().length == 5).length === this.players.length){
                    this.state = GameState.SCORING;
                    this.step();
                } else {
                    this.state = GameState.DRAW_THREE_DRAW;
                    this.current = (this.current + 1) % this.players.length;
                }

                //again.... skip over any players in fantasy...
                while (this.players[this.current].nextHandFantasyCards > 0) {
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
