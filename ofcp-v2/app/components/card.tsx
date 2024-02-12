import { Paper, Typography } from "@mui/material";

export default function PrettyCard ({card, disabled, hidden} : {card: string, disabled?: boolean, hidden?: boolean}) {
    const color = (()=>{
        if (!card) { return 'white' };
        switch(card[1]){ case 's': return 'black'; case 'd': return 'blue'; case 'h': return 'red'; case 'c': return 'green'; default: return 'white'; }
    })();
    const prettyCard = card;//card.replace('s','&#9824;').replace('h','&#9829;').replace('d','&#9830;').replace('c','&#9827;');

    return <Paper sx={{opacity:disabled?0.2:1}}>
        {hidden ?
            <Typography
                variant='h4' 
                sx={{background: 'black', userSelect: 'none', color: 'black'}}
            >
                ----
            </Typography> :
            <Typography
                variant='h4' 
                sx={{background: color, userSelect: 'none', color: 'white'}}
            >
                {prettyCard}
            </Typography>
        }
    </Paper>;
}
