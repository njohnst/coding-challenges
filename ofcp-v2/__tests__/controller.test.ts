import Controller, { GameState } from '@/app/controller/controller';
import Player from '@/app/controller/player';
import '@testing-library/jest-dom';

describe('FSM test - 2 player', () => {
    const controller = new Controller();

    //if player1 and player2 are both not in fantasy:
    it('should transition from START to SCORING while passing through the correct states', () => {
        expect(controller.state).toEqual(GameState.START);

        controller.startGame([new Player('player1'), new Player('player2')]);

        //1st player (in random order) draws 5 cards
        const firstRandomIndex = controller.current;

        expect(controller.state).toEqual(GameState.FIRST_FIVE_DRAW);
        controller.step();
        expect(controller.state).toEqual(GameState.FIRST_FIVE);
        //set the 5 cards randomly to the front and middle row
        controller.players[controller.current].draftFront = controller.players[controller.current].hand.splice(0, 3);
        controller.players[controller.current].draftMiddle = controller.players[controller.current].hand.splice(0, 2);
        controller.step();

        //2nd player (in random order) draws 5 cards
        const secondRandomIndex = controller.current;

        expect(controller.state).toEqual(GameState.FIRST_FIVE_DRAW);
        controller.step();
        expect(controller.state).toEqual(GameState.FIRST_FIVE);
        //set the 5 cards randomly to the front and middle row
        controller.players[controller.current].draftFront = controller.players[controller.current].hand.splice(0, 3);
        controller.players[controller.current].draftMiddle = controller.players[controller.current].hand.splice(0, 2);
        controller.step();

        //now each player takes turn drawing 3 cards, playing 2 until they have set all 3 boards
        //they need to play 13 cards total, and they played 5 in the first turn, so they need to play 4*2 more
        for (let i = 0; i < 4; i++) {
            //first player
            expect(controller.state).toEqual(GameState.DRAW_THREE_DRAW);
            expect(controller.current).toEqual(firstRandomIndex);
            controller.step();
            expect(controller.state).toEqual(GameState.DRAW_THREE);
            expect(controller.current).toEqual(firstRandomIndex);
            //set 2 of the cards randomly, filling from middle to back
            if (controller.players[controller.current].middle.length < 4) {
                controller.players[controller.current].draftMiddle = controller.players[controller.current].hand.splice(0, 2);
            } else if (controller.players[controller.current].middle.length < 5) {
                controller.players[controller.current].draftMiddle = controller.players[controller.current].hand.splice(0, 1);
                controller.players[controller.current].draftBack = controller.players[controller.current].hand.splice(0, 1);
            } else {
                controller.players[controller.current].draftBack = controller.players[controller.current].hand.splice(0, 2);
            }
            controller.step();

            //other player
            expect(controller.state).toEqual(GameState.DRAW_THREE_DRAW);
            expect(controller.current).toEqual(secondRandomIndex);
            controller.step();
            expect(controller.state).toEqual(GameState.DRAW_THREE);
            expect(controller.current).toEqual(secondRandomIndex);
            //set 2 of the cards randomly, filling from middle to back
            if (controller.players[controller.current].middle.length < 4) {
                controller.players[controller.current].draftMiddle = controller.players[controller.current].hand.splice(0, 2);
            } else if (controller.players[controller.current].middle.length < 5) {
                controller.players[controller.current].draftMiddle = controller.players[controller.current].hand.splice(0, 1);
                controller.players[controller.current].draftBack = controller.players[controller.current].hand.splice(0, 1);
            } else {
                controller.players[controller.current].draftBack = controller.players[controller.current].hand.splice(0, 2);
            }
            controller.step();
        }

        //now we should be in the START state
        //since the SCORING state is passed over...
        //the backs of both players should be full (as well as middle and front, but we assume they are for simplicity, since we fill back last...)
        expect(controller.players[0].back.length).toEqual(5);
        expect(controller.players[1].back.length).toEqual(5);
        expect(controller.state).toEqual(GameState.START);
    });

    //if player1 and player2 are both in fantasy:
    it('should transition from START, through FANTASY_DRAW, to SCORING in the correct order', () => {
        controller.startGame([new Player('player1'), new Player('player2')]);
        controller.state = GameState.START;
        controller.players[0].nextHandFantasyCards = 14;
        controller.players[1].nextHandFantasyCards = 14;

        expect(controller.state).toEqual(GameState.START);
        controller.step();

        //1st player (in random order) enters FANTASY_DRAW
        expect(controller.state).toEqual(GameState.FANTASY_DRAW);
        controller.step();
        expect(controller.state).toEqual(GameState.FANTASY);
        //set all the hands randomly...
        controller.players[controller.current].draftFront = controller.players[controller.current].hand.splice(0, 3);
        controller.players[controller.current].draftMiddle = controller.players[controller.current].hand.splice(0, 5);
        controller.players[controller.current].draftBack = controller.players[controller.current].hand.splice(0, 5);
        controller.step();

        //2nd player (in random order) draws 5 cards
        expect(controller.state).toEqual(GameState.FANTASY_DRAW);
        controller.step();
        expect(controller.state).toEqual(GameState.FANTASY);
        //set all the hands randomly...
        controller.players[controller.current].draftFront = controller.players[controller.current].hand.splice(0, 3);
        controller.players[controller.current].draftMiddle = controller.players[controller.current].hand.splice(0, 5);
        controller.players[controller.current].draftBack = controller.players[controller.current].hand.splice(0, 5);
        controller.step();

        //now we should be in the START state
        //since the SCORING state is passed over...
        //the backs of both players should be full (as well as middle and front, but we assume they are for simplicity, since we fill back last...)
        expect(controller.players[0].back.length).toEqual(5);
        expect(controller.players[1].back.length).toEqual(5);
        expect(controller.state).toEqual(GameState.START);
    });

    //if player1 is in fantasy and player2 is not:
    //(and vice versa, transitive)
    it('should transition from START, through FANTASY_DRAW for the fantasy player first, then FIRST_FIVE_DRAW and other states until SCORING in the correct order', () => {
        controller.startGame([new Player('player1'), new Player('player2')]);
        controller.state = GameState.START;
        controller.players[0].nextHandFantasyCards = 14;
        controller.players[1].nextHandFantasyCards = 0;

        //force the non-fantasy player to act first to avoid randomness from interfering with the test
        controller.dealer = 1; //START will shift the dealer from p2 => p1 automatically, which will make p2 act first

        expect(controller.state).toEqual(GameState.START);
        controller.step();

        //player1 should enter FANTASY_DRAW, it doesn't matter the order of the dealer...
        expect(controller.state).toEqual(GameState.FANTASY_DRAW);
        controller.step();
        expect(controller.state).toEqual(GameState.FANTASY);
        //set all the hands randomly...
        controller.players[controller.current].draftFront = controller.players[controller.current].hand.splice(0, 3);
        controller.players[controller.current].draftMiddle = controller.players[controller.current].hand.splice(0, 5);
        controller.players[controller.current].draftBack = controller.players[controller.current].hand.splice(0, 5);
        controller.step();

        //player2 draws 5 cards
        expect(controller.state).toEqual(GameState.FIRST_FIVE_DRAW);
        controller.step();
        expect(controller.state).toEqual(GameState.FIRST_FIVE);
        //set back randomly
        controller.players[controller.current].draftBack = controller.players[controller.current].hand.splice(0, 5);
        controller.step();

        //player2 draws 3 until he's full (round 1)
        expect(controller.state).toEqual(GameState.DRAW_THREE_DRAW);
        controller.step();
        expect(controller.state).toEqual(GameState.DRAW_THREE);
        //set middle randomly
        controller.players[controller.current].draftMiddle = controller.players[controller.current].hand.splice(0, 2);
        controller.step();

        //player2 draws 3 until he's full (round 2)
        expect(controller.state).toEqual(GameState.DRAW_THREE_DRAW);
        controller.step();
        expect(controller.state).toEqual(GameState.DRAW_THREE);
        //set middle randomly
        controller.players[controller.current].draftMiddle = controller.players[controller.current].hand.splice(0, 2);
        controller.step();

        //player2 draws 3 until he's full (round 3)
        expect(controller.state).toEqual(GameState.DRAW_THREE_DRAW);
        controller.step();
        expect(controller.state).toEqual(GameState.DRAW_THREE);
        //set middle and front randomly
        controller.players[controller.current].draftMiddle = controller.players[controller.current].hand.splice(0, 1);
        controller.players[controller.current].draftFront = controller.players[controller.current].hand.splice(0, 1);
        controller.step();
        
        //player2 draws 3 until he's full (round 4, final)
        expect(controller.state).toEqual(GameState.DRAW_THREE_DRAW);
        controller.step();
        expect(controller.state).toEqual(GameState.DRAW_THREE);
        //set front randomly
        controller.players[controller.current].draftFront = controller.players[controller.current].hand.splice(0, 2);
        controller.step();


        //now we should be in the START state
        //since the SCORING state is passed over...
        //the backs, middles and fronts of both players should be full
        expect(controller.players[0].back.length).toEqual(5);
        expect(controller.players[1].back.length).toEqual(5);
        expect(controller.players[0].middle.length).toEqual(5);
        expect(controller.players[1].middle.length).toEqual(5);
        expect(controller.players[0].front.length).toEqual(3);
        expect(controller.players[1].front.length).toEqual(3);
        expect(controller.state).toEqual(GameState.START);
    });


    //test both players entering fantasy, from a previous hand...
    //if player1 and player2 are both not in fantasy:
    it('should transition from START to SCORING while passing through the correct states', () => {
        expect(controller.state).toEqual(GameState.START);

        controller.startGame([new Player('player1'), new Player('player2')]);

        controller.players[0].front = ['Qc','Qd','2s'];
        controller.players[1].front = ['Kc', 'Kd', '2s'];

        controller.players[0].middle = ['As','Kh','Qh','Jh','Th'];
        controller.players[1].middle = ['Ad','Ks','Qs','Js','Ts'];

        controller.players[0].back = ['3s','3c','3d','3h','5h'];
        controller.players[1].back = ['4s','4c','4d','4h','6h'];

        //now set the state to scoring...
        controller.state = GameState.SCORING;
        controller.step(); //and step...

        //now we should be in the START state
        //and both players should be in fantasy...
        expect(controller.state).toEqual(GameState.START);
        expect(controller.players[0].nextHandFantasyCards).toEqual(14);
        expect(controller.players[1].nextHandFantasyCards).toEqual(14);
    });
});

///
//
///

describe('FSM test - 3 players', () => {
    const controller = new Controller();

    //if no players are in fantasy:
    it('should transition from START to SCORING while passing through the correct states', () => {
        expect(controller.state).toEqual(GameState.START);

        controller.startGame([new Player('player1'), new Player('player2'), new Player('player3')]);

        //1st player (in random order) draws 5 cards
        const firstRandomIndex = controller.current;

        expect(controller.state).toEqual(GameState.FIRST_FIVE_DRAW);
        controller.step();
        expect(controller.state).toEqual(GameState.FIRST_FIVE);
        //set the 5 cards randomly to the front and middle row
        controller.players[controller.current].draftFront = controller.players[controller.current].hand.splice(0, 3);
        controller.players[controller.current].draftMiddle = controller.players[controller.current].hand.splice(0, 2);
        controller.step();

        //2nd player (in random order) draws 5 cards
        const secondRandomIndex = controller.current;

        expect(controller.state).toEqual(GameState.FIRST_FIVE_DRAW);
        controller.step();
        expect(controller.state).toEqual(GameState.FIRST_FIVE);
        //set the 5 cards randomly to the front and middle row
        controller.players[controller.current].draftFront = controller.players[controller.current].hand.splice(0, 3);
        controller.players[controller.current].draftMiddle = controller.players[controller.current].hand.splice(0, 2);
        controller.step();

        //3rd player (in random order) draws 5 cards
        const thirdRandomIndex = controller.current;

        expect(controller.state).toEqual(GameState.FIRST_FIVE_DRAW);
        controller.step();
        expect(controller.state).toEqual(GameState.FIRST_FIVE);
        //set the 5 cards randomly to the front and middle row
        controller.players[controller.current].draftFront = controller.players[controller.current].hand.splice(0, 3);
        controller.players[controller.current].draftMiddle = controller.players[controller.current].hand.splice(0, 2);
        controller.step();

        //now each player takes turn drawing 3 cards, playing 2 until they have set all 3 boards
        //they need to play 13 cards total, and they played 5 in the first turn, so they need to play 4*2 more
        for (let i = 0; i < 4; i++) {
            //first player
            expect(controller.state).toEqual(GameState.DRAW_THREE_DRAW);
            expect(controller.current).toEqual(firstRandomIndex);
            controller.step();
            expect(controller.state).toEqual(GameState.DRAW_THREE);
            expect(controller.current).toEqual(firstRandomIndex);
            //set 2 of the cards randomly, filling from middle to back
            if (controller.players[controller.current].middle.length < 4) {
                controller.players[controller.current].draftMiddle = controller.players[controller.current].hand.splice(0, 2);
            } else if (controller.players[controller.current].middle.length < 5) {
                controller.players[controller.current].draftMiddle = controller.players[controller.current].hand.splice(0, 1);
                controller.players[controller.current].draftBack = controller.players[controller.current].hand.splice(0, 1);
            } else {
                controller.players[controller.current].draftBack = controller.players[controller.current].hand.splice(0, 2);
            }
            controller.step();

            //second player
            expect(controller.state).toEqual(GameState.DRAW_THREE_DRAW);
            expect(controller.current).toEqual(secondRandomIndex);
            controller.step();
            expect(controller.state).toEqual(GameState.DRAW_THREE);
            expect(controller.current).toEqual(secondRandomIndex);
            //set 2 of the cards randomly, filling from middle to back
            if (controller.players[controller.current].middle.length < 4) {
                controller.players[controller.current].draftMiddle = controller.players[controller.current].hand.splice(0, 2);
            } else if (controller.players[controller.current].middle.length < 5) {
                controller.players[controller.current].draftMiddle = controller.players[controller.current].hand.splice(0, 1);
                controller.players[controller.current].draftBack = controller.players[controller.current].hand.splice(0, 1);
            } else {
                controller.players[controller.current].draftBack = controller.players[controller.current].hand.splice(0, 2);
            }
            controller.step();

            //third player
            expect(controller.state).toEqual(GameState.DRAW_THREE_DRAW);
            expect(controller.current).toEqual(thirdRandomIndex);
            controller.step();
            expect(controller.state).toEqual(GameState.DRAW_THREE);
            expect(controller.current).toEqual(thirdRandomIndex);

            //set 2 of the cards randomly, filling from middle to back
            if (controller.players[controller.current].middle.length < 4) {
                controller.players[controller.current].draftMiddle = controller.players[controller.current].hand.splice(0, 2);
            } else if (controller.players[controller.current].middle.length < 5) {
                controller.players[controller.current].draftMiddle = controller.players[controller.current].hand.splice(0, 1);
                controller.players[controller.current].draftBack = controller.players[controller.current].hand.splice(0, 1);
            } else {
                controller.players[controller.current].draftBack = controller.players[controller.current].hand.splice(0, 2);
            }
            controller.step();
        }

        //now we should be in the START state
        //since the SCORING state is passed over...
        //the backs of both players should be full (as well as middle and front, but we assume they are for simplicity, since we fill back last...)
        expect(controller.players[0].back.length).toEqual(5);
        expect(controller.players[1].back.length).toEqual(5);
        expect(controller.players[2].back.length).toEqual(5);
        expect(controller.state).toEqual(GameState.START);
    });

    //if all 3 players are in fantasy:
    it('should transition from START, through FANTASY_DRAW, to SCORING in the correct order', () => {
        controller.startGame([new Player('player1'), new Player('player2'), new Player('player3')]);
        controller.state = GameState.START;
        controller.players[0].nextHandFantasyCards = 14;
        controller.players[1].nextHandFantasyCards = 14;
        controller.players[2].nextHandFantasyCards = 14;

        expect(controller.state).toEqual(GameState.START);
        controller.step();

        //1st player (in random order) enters FANTASY_DRAW
        expect(controller.state).toEqual(GameState.FANTASY_DRAW);
        controller.step();
        expect(controller.state).toEqual(GameState.FANTASY);
        //set all the hands randomly...
        controller.players[controller.current].draftFront = controller.players[controller.current].hand.splice(0, 3);
        controller.players[controller.current].draftMiddle = controller.players[controller.current].hand.splice(0, 5);
        controller.players[controller.current].draftBack = controller.players[controller.current].hand.splice(0, 5);
        controller.step();

        //2nd player (in random order) draws 5 cards
        expect(controller.state).toEqual(GameState.FANTASY_DRAW);
        controller.step();
        expect(controller.state).toEqual(GameState.FANTASY);
        //set all the hands randomly...
        controller.players[controller.current].draftFront = controller.players[controller.current].hand.splice(0, 3);
        controller.players[controller.current].draftMiddle = controller.players[controller.current].hand.splice(0, 5);
        controller.players[controller.current].draftBack = controller.players[controller.current].hand.splice(0, 5);
        controller.step();
        
        //3rd player (in random order) draws 5 cards
        expect(controller.state).toEqual(GameState.FANTASY_DRAW);
        controller.step();
        expect(controller.state).toEqual(GameState.FANTASY);
        //set all the hands randomly...
        controller.players[controller.current].draftFront = controller.players[controller.current].hand.splice(0, 3);
        controller.players[controller.current].draftMiddle = controller.players[controller.current].hand.splice(0, 5);
        controller.players[controller.current].draftBack = controller.players[controller.current].hand.splice(0, 5);
        controller.step();


        //now we should be in the START state
        //since the SCORING state is passed over...
        //the backs of both players should be full (as well as middle and front, but we assume they are for simplicity, since we fill back last...)
        expect(controller.players[0].back.length).toEqual(5);
        expect(controller.players[1].back.length).toEqual(5);
        expect(controller.players[2].back.length).toEqual(5);
        expect(controller.state).toEqual(GameState.START);
    });

    //if 1/3 players are in fantasy:
    it('should transition from START, through FANTASY_DRAW for the fantasy player first, then FIRST_FIVE_DRAW and other states until SCORING in the correct order', () => {
        controller.startGame([new Player('player1'), new Player('player2'), new Player('player3')]);
        controller.state = GameState.START;
        controller.players[0].nextHandFantasyCards = 14;
        controller.players[1].nextHandFantasyCards = 0;
        controller.players[2].nextHandFantasyCards = 0;

        //force the non-fantasy player to act first to avoid randomness from interfering with the test
        controller.dealer = 2; //START will shift the dealer from p3 => p1 automatically, which will make p2 act first

        expect(controller.state).toEqual(GameState.START);
        controller.step();

        //player1 should enter FANTASY_DRAW, it doesn't matter the order of the dealer...
        expect(controller.state).toEqual(GameState.FANTASY_DRAW);
        controller.step();
        expect(controller.state).toEqual(GameState.FANTASY);
        //set all the hands randomly...
        controller.players[controller.current].draftFront = controller.players[controller.current].hand.splice(0, 3);
        controller.players[controller.current].draftMiddle = controller.players[controller.current].hand.splice(0, 5);
        controller.players[controller.current].draftBack = controller.players[controller.current].hand.splice(0, 5);
        controller.step();

        //player2 draws 5 cards
        expect(controller.state).toEqual(GameState.FIRST_FIVE_DRAW);
        expect(controller.current).toEqual(1); //p2 = 1
        controller.step();
        expect(controller.state).toEqual(GameState.FIRST_FIVE);
        expect(controller.current).toEqual(1); //p2 = 1
        //set first 5 randomly
        controller.players[controller.current].draftFront = controller.players[controller.current].hand.splice(0, 3);
        controller.players[controller.current].draftMiddle = controller.players[controller.current].hand.splice(0, 2);
        controller.step();

        ////player3 draws 5 cards
        expect(controller.state).toEqual(GameState.FIRST_FIVE_DRAW);
        expect(controller.current).toEqual(2); //p3 = 2
        controller.step();
        expect(controller.state).toEqual(GameState.FIRST_FIVE);
        expect(controller.current).toEqual(2); //p3 = 2
        //set first 5 randomly
        controller.players[controller.current].draftFront = controller.players[controller.current].hand.splice(0, 3);
        controller.players[controller.current].draftMiddle = controller.players[controller.current].hand.splice(0, 2);
        controller.step();

        //now each player (p2, p3) takes turn drawing 3 cards, playing 2 until they have set all 3 boards
        //they need to play 13 cards total, and they played 5 in the first turn, so they need to play 4*2 more
        for (let i = 0; i < 4; i++) {
            //p2
            expect(controller.state).toEqual(GameState.DRAW_THREE_DRAW);
            expect(controller.current).toEqual(1); //p2 = 1
            controller.step();
            expect(controller.state).toEqual(GameState.DRAW_THREE);
            expect(controller.current).toEqual(1); //p2 = 1
            //set 2 of the cards randomly, filling from middle to back
            if (controller.players[controller.current].middle.length < 4) {
                controller.players[controller.current].draftMiddle = controller.players[controller.current].hand.splice(0, 2);
            } else if (controller.players[controller.current].middle.length < 5) {
                controller.players[controller.current].draftMiddle = controller.players[controller.current].hand.splice(0, 1);
                controller.players[controller.current].draftBack = controller.players[controller.current].hand.splice(0, 1);
            } else {
                controller.players[controller.current].draftBack = controller.players[controller.current].hand.splice(0, 2);
            }
            controller.step();

            //p3
            expect(controller.state).toEqual(GameState.DRAW_THREE_DRAW);
            expect(controller.current).toEqual(2); //p3 = 2
            controller.step();
            expect(controller.state).toEqual(GameState.DRAW_THREE);
            expect(controller.current).toEqual(2); //p3 = 2
            //set 2 of the cards randomly, filling from middle to back
            if (controller.players[controller.current].middle.length < 4) {
                controller.players[controller.current].draftMiddle = controller.players[controller.current].hand.splice(0, 2);
            } else if (controller.players[controller.current].middle.length < 5) {
                controller.players[controller.current].draftMiddle = controller.players[controller.current].hand.splice(0, 1);
                controller.players[controller.current].draftBack = controller.players[controller.current].hand.splice(0, 1);
            } else {
                controller.players[controller.current].draftBack = controller.players[controller.current].hand.splice(0, 2);
            }
            controller.step();
        }

        //now we should be in the START state
        //since the SCORING state is passed over...
        //the backs, middles and fronts of both players should be full
        expect(controller.players[0].back.length).toEqual(5);
        expect(controller.players[1].back.length).toEqual(5);
        expect(controller.players[2].back.length).toEqual(5);
        expect(controller.players[0].middle.length).toEqual(5);
        expect(controller.players[1].middle.length).toEqual(5);
        expect(controller.players[2].middle.length).toEqual(5);
        expect(controller.players[0].front.length).toEqual(3);
        expect(controller.players[1].front.length).toEqual(3);
        expect(controller.players[2].front.length).toEqual(3);
        expect(controller.state).toEqual(GameState.START);
    });
});
