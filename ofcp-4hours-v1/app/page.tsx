'use client';
import { Button, Grid, Paper, Stack } from "@mui/material";
import { useState } from "react";

const defaultDeck = [
    'As', 'Ac', 'Ad', 'Ah',
    'Ks', 'Kc', 'Kd', 'Kh',
    'Qs', 'Qc', 'Qd', 'Qh',
    'Js', 'Jc', 'Jd', 'Jh',
    'Ts', 'Tc', 'Td', 'Th',
    '9s', '9c', '9d', '9h',
    '8s', '8c', '8d', '8h',
    '7s', '7c', '7d', '7h',
    '6s', '6c', '6d', '6h',
    '5s', '5c', '5d', '5h',
    '4s', '4c', '4d', '4h',
    '3s', '3c', '3d', '3h',
    '2s', '2c', '2d', '2h',
];

const defaultBoards = [
    ['','',''],
    ['','','','',''],
    ['','','','','']
];

const defaultSet = [[false,false,false],[false,false,false,false,false],[false,false,false,false,false]];

const getCardColor = (card) => {
    if (card.endsWith('s')){
            return 'black';
    }else if (card.endsWith('d')) {
            return 'blue';
    }else if (card.endsWith('h')){
            return 'red';
    }else if (card.endsWith('c')){
            return 'green';
    }

    return 'white';    
};

const shuffle = (deck) => {
    const newDeck = Array.from(deck);
    let temp, val;

    for (let i = 0; i < deck.length; i++) { 
        temp = Math.round(Math.random()*(deck.length-1));
        val = newDeck[temp];
        newDeck[temp] = newDeck[i];
        newDeck[i] = val;
    }

    //console.log(newDeck);
    return newDeck;
};

const CardButton = ({card, selectedCard, setSelectedCard, isBoard = false, isSet = false}) => {
    //const disabled = isSet ? true : (isBoard ? (card == '' ? selectedCard && selectedCard != card : card == '') : (selectedCard && selectedCard != card));

    const isCard = card != '-';
    const isSelected = selectedCard != '';

    const disabled = (()=>{
        if (isSet) { return true; } //disable, we are set!
        if (isBoard) {
            if (isCard && isSelected) {
                return true; //if we have a card, and a card has been selected, then disable
            }
    
            if (!isCard && !isSelected) {
                return true; //if we don't have a card, and a card hasn't been selected, disable
            }

            return false; //otherwise this should be clickable!
        }

        //otherwise, in the non board case:
        return (isSelected && selectedCard != card); //disabled if a card that is not us has been selected
    })();

    return <Paper sx={{display: 'grid', justifyContent: 'center', background:getCardColor(card),opacity:(disabled)?0.5:1}} >
        <Button disabled={disabled} id={card} onClick={() => setSelectedCard(selectedCard ? '' : card)} sx={{opacity:(disabled)?0.5:1}}>
            <span style={{color:'white'}}>
                {card}
            </span>
        </Button>
    </Paper>
};

const CardBorder = ({children}) => {
    return <div style={{border:'solid', borderWidth: '0.25px'}}>
        {children}
    </div>;
};

export default function Page() {
    const [deck,setDeck] = useState(shuffle(defaultDeck));

    const [p1Fantasy, setP1Fantasy] = useState(false);
    const [p2Fantasy, setP2Fantasy] = useState(false);

    const [dealer, setDealer] = useState(Math.round(Math.random()));
    const [currentPlayer, setCurrentPlayer] = useState((dealer+1)%2); //0 = P1, 1 = P2

    const [p1Hand, setP1Hand] = useState([]);
    const [p2Hand, setP2Hand] = useState([]);

    const [p1Boards, setP1Boards] = useState([Array.from(defaultBoards[0]),Array.from(defaultBoards[1]),Array.from(defaultBoards[2])]);
    const [p2Boards, setP2Boards] = useState([Array.from(defaultBoards[0]),Array.from(defaultBoards[1]),Array.from(defaultBoards[2])]);

    const [p1BoardsSet, setP1BoardsSet] = useState([Array.from(defaultSet[0]),Array.from(defaultSet[1]),Array.from(defaultSet[2])]);
    const [p2BoardsSet, setP2BoardsSet] = useState([Array.from(defaultSet[0]),Array.from(defaultSet[1]),Array.from(defaultSet[2])]);

    const [selectedCard, setSelectedCard] = useState('');
    const [canDraw, setCanDraw] = useState(true);

    const nextHand = () => {
        setCurrentPlayer(dealer);
        setDealer((dealer+1)%2);
        setP1Fantasy(false);
        setP2Fantasy(false);
        setP1Boards([Array.from(defaultBoards[0]),Array.from(defaultBoards[1]),Array.from(defaultBoards[2])]);
        setP2Boards([Array.from(defaultBoards[0]),Array.from(defaultBoards[1]),Array.from(defaultBoards[2])]);
        setP1Hand([]);
        setP2Hand([]);
        setSelectedCard('');
        setDeck(shuffle(defaultDeck));

        setP1BoardsSet([Array.from(defaultSet[0]),Array.from(defaultSet[1]),Array.from(defaultSet[2])]);
        setP2BoardsSet([Array.from(defaultSet[0]),Array.from(defaultSet[1]),Array.from(defaultSet[2])]);

        setCanDraw(true);
    };

    const drawN = (n, player) => {
        const newDeck = Array.from(deck);
        const ret = [];
        for (let i = 0; i < n; i++) { ret.push(newDeck.shift()); }
        setDeck(newDeck);
        
        player == 0 ? setP1Hand(ret) : setP2Hand(ret);

        setCanDraw(false);
    };

    const playSelected = (player, board, position) => {
        const newBoards = player == 0 ? Array.from(p1Boards) : Array.from(p2Boards);

        newBoards[board][position] = selectedCard;
        
        if (player == 0) {
            setP1Hand(p1Hand.filter(
                card => card != selectedCard
            ))
            setP1Boards(newBoards);
        } else {
            setP2Hand(p2Hand.filter(
                card => card != selectedCard
            ))
            setP2Boards(newBoards);
        }

        setSelectedCard('');
    };

    const returnCard = (player, card, board, position) => {
        const newBoards = player == 0 ? Array.from(p1Boards) : Array.from(p2Boards);

        newBoards[board][position] = '';

        if (player == 0) {
            setP1Hand(p1Hand.concat(card));
            setP1Boards(newBoards);
        } else { 
            setP2Hand(p2Hand.concat(card));
            setP2Boards(newBoards);
        }

        setSelectedCard('');
    };

    const moveSet = (player) => {
        const cBoard = player == 0 ? p1Boards : p2Boards;
        const newBoardSet = player == 0 ? Array.from(p1BoardsSet) : Array.from(p2BoardsSet);

        for(let board = 0; board < 3; board++){
            for (let pos = 0; pos < (board == 0 ? 3 : 5); pos++) {
                if (cBoard[board][pos] != '') {
                    newBoardSet[board][pos] = true;
                }
            }
        }

        if (player == 0) {
            setP1BoardsSet(newBoardSet);
        } else {
            setP2BoardsSet(newBoardSet);
        }

        //next move!
        setCurrentPlayer((currentPlayer+1)%2);
        setSelectedCard('');
        setCanDraw(true);
        setP1Hand([]); //discard remaining cards
        setP2Hand([]); //discard remaining cards
    };

    return (
        // <h1>Hello world!</h1>
        <>
            <Grid container>
                <Grid item xs={12} border='solid' borderColor='black'>
                    <Button onClick={() => confirm("Are you sure?") && nextHand()} color='warning' size='small' variant='contained'>Next Hand</Button>
                </Grid>
                <Grid item xs={6} border={'solid'} borderColor={!currentPlayer ? 'green' : 'black'}>
                    <Stack spacing={1}>
                        <b>P1{!dealer ? "(D)": ""}</b>
                        <Button onClick={() => drawN(deck.length < 43 ? 3 : 5, 0)} disabled={!!currentPlayer || !canDraw} size='small' variant='contained'>Draw</Button>
                        <Button onClick={() => confirm("Go to fantasy land?") && drawN(13, 0)} disabled={deck.length < defaultDeck.length} size='small' variant='contained' color='secondary'>FL</Button>
                        <Stack spacing={1} direction='row'>
                            {p1Hand.map(card => {
                                return <CardButton
                                    card={card}
                                    selectedCard={selectedCard}
                                    setSelectedCard={setSelectedCard}
                                    isSet={p1Hand.length==1 && deck.length <42} //hacking this one! lets disable this button if we're on the 3 draw phase and need to discard a card...
                                />
                            })}
                            {
                                (currentPlayer == 0 && !canDraw && (deck.length >= 42 ? p1Hand.length == 0 : p1Hand.length == 1)) && 
                                <Button onClick={()=>moveSet(0)} variant='contained' color='secondary'>
                                    Set
                                </Button>
                            }
                        </Stack>
                        <Grid container spacing={1}>
                            <Grid item xs={4}>
                                <Stack alignItems='center'>
                                    {p1Boards[2].map((card,i) => <CardBorder>
                                                <CardButton
                                                    card={card || '-'}
                                                    selectedCard={selectedCard}
                                                    setSelectedCard={!selectedCard ? returnCard.bind(this,0,card,2,i) : playSelected.bind(this,0,2,i)}
                                                    isBoard
                                                    isSet={p1BoardsSet[2][i]}
                                                />
                                    </CardBorder>)}
                                </Stack>
                            </Grid>
                            <Grid item xs={4}>
                                <Stack alignItems='center'>
                                    {p1Boards[1].map((card, i) => <CardBorder>
                                            <CardButton
                                                card={card || '-'}
                                                selectedCard={selectedCard}
                                                setSelectedCard={!selectedCard ? returnCard.bind(this,0,card,1,i) : playSelected.bind(this,0,1,i)}
                                                isBoard
                                                isSet={p1BoardsSet[1][i]}
                                            />
                                    </CardBorder>)}
                                </Stack>
                            </Grid>
                            <Grid item xs={4}>
                                <Stack alignItems='center'>
                                    {p1Boards[0].map((card, i) => <CardBorder>
                                        <CardButton
                                            card={card || '-'}
                                            selectedCard={selectedCard}
                                            setSelectedCard={!selectedCard ? returnCard.bind(this,0,card,0,i) : playSelected.bind(this,0,0,i)}
                                            isBoard
                                            isSet={p1BoardsSet[0][i]}
                                        />
                                    </CardBorder>)}
                                </Stack>
                            </Grid>
                        </Grid>
                    </Stack>
                    
                </Grid>
                <Grid item xs={6} border={'solid'} borderColor={currentPlayer ? 'green' : 'black'}>
                    <Stack spacing={1}>
                        <b>P2{dealer ? "(D)": ""}</b>
                        <Button onClick={() => drawN(deck.length < 43 ? 3 : 5, 1)} disabled={!currentPlayer || !canDraw} size='small' variant='contained'>Draw</Button>
                        <Button onClick={() => confirm("Go to fantasy land?") && drawN(13, 1)} disabled={deck.length < defaultDeck.length} size='small' variant='contained' color='secondary'>FL</Button>
                        <Stack spacing={1} direction='row'>
                            {p2Hand.map(card => {
                                return <CardButton
                                    card={card}
                                    selectedCard={selectedCard}
                                    setSelectedCard={setSelectedCard}
                                    isSet={p2Hand.length==1 && deck.length <42} //hacking this one! lets disable this button if we're on the 3 draw phase and need to discard a card...
                                />
                            })}
                            {
                                (currentPlayer == 1 && !canDraw && (deck.length >= 42 ? p2Hand.length == 0 : p2Hand.length == 1)) && 
                                <Button onClick={()=>moveSet(1)} variant='contained' color='secondary'>
                                    Set
                                </Button>
                            }
                        </Stack>
                        <Grid container spacing={1}>
                            <Grid item xs={4}>
                                <Stack alignItems='center'>
                                    {p2Boards[2].map((card,i) => <CardBorder>
                                                <CardButton
                                                    card={card || '-'}
                                                    selectedCard={selectedCard}
                                                    setSelectedCard={!selectedCard ? returnCard.bind(this,1,card,2,i) : playSelected.bind(this,1,2,i)}
                                                    isBoard
                                                    isSet={p2BoardsSet[2][i]}
                                                />
                                    </CardBorder>)}
                                </Stack>
                            </Grid>
                            <Grid item xs={4}>
                                <Stack alignItems='center'>
                                    {p2Boards[1].map((card, i) => <CardBorder>
                                            <CardButton
                                                card={card || '-'}
                                                selectedCard={selectedCard}
                                                setSelectedCard={!selectedCard ? returnCard.bind(this,1,card,1,i) : playSelected.bind(this,1,1,i)}
                                                isBoard
                                                isSet={p2BoardsSet[1][i]}
                                            />
                                    </CardBorder>)}
                                </Stack>
                            </Grid>
                            <Grid item xs={4}>
                                <Stack alignItems='center'>
                                    {p2Boards[0].map((card, i) => <CardBorder>
                                        <CardButton
                                            card={card || '-'}
                                            selectedCard={selectedCard}
                                            setSelectedCard={!selectedCard ? returnCard.bind(this,1,card,0,i) : playSelected.bind(this,1,0,i)}
                                            isBoard
                                            isSet={p2BoardsSet[0][i]}
                                        />
                                    </CardBorder>)}
                                </Stack>
                            </Grid>
                        </Grid>
                    </Stack>
                </Grid>
            </Grid>
        </>
    );
};
