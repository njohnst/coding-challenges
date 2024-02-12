export enum HandClass {
    HIGH_CARD,
    ONE_PAIR,
    TWO_PAIR,
    THREE_OF_A_KIND,
    STRAIGHT,
    FLUSH,
    FULL_HOUSE,
    FOUR_OF_A_KIND,
    STRAIGHT_FLUSH,
    ROYAL_FLUSH
};

export const rankOrder = "23456789TJQKA";

const sortCards = ([rank1, _] : string[], [rank2, __]: string[]): number => {
    return rankOrder.indexOf(rank1) - rankOrder.indexOf(rank2);
}

const sortRankCounts = ([rank1, _]: [string, number], [rank2, __]: [string,number]): number => {
    //sort in descending order of rank
    return rankOrder.indexOf(rank2) - rankOrder.indexOf(rank1);
}

export function isFantasy([frontClass, frontStrength]: [HandClass, number], [backClass, backStrength]: [HandClass, number], isFantasyAlready: boolean): boolean {
    if (isFantasyAlready) {
        //if already in fantasy, need trips in the front or quads or better in the back to stay in fantasy
        return backClass >= HandClass.FOUR_OF_A_KIND || frontClass == HandClass.THREE_OF_A_KIND;
    } else {
        //if not already in fantasy, just need QQ or better in the front
        return frontClass == HandClass.THREE_OF_A_KIND || (frontClass == HandClass.ONE_PAIR && Math.floor(frontStrength / (16**3)) >= rankOrder.indexOf('Q'));
    }
}

export function isBust([frontClass,frontStrength]: [HandClass, number], [middleClass, middleStrength]: [HandClass, number], [backClass, backStrength]: [HandClass, number]): boolean {
    if (frontClass > middleClass || (frontClass == middleClass && frontStrength > middleStrength) || (middleClass > backClass) || (middleClass == backClass && middleStrength > backStrength)) {
        return true; //bust
    }
    return false; //not bust
}

export function evaluate3CardHand(hand: string[]): [HandClass, number] {
    //sort in descending order of rank
    const parsedHand = hand.map(card => card.slice(0,1)).toSorted((r1, r2) => rankOrder.indexOf(r2) - rankOrder.indexOf(r1));

    if (parsedHand[0] == parsedHand[1] && parsedHand[1] == parsedHand[2]) {
        return [HandClass.THREE_OF_A_KIND, rankOrder.indexOf(parsedHand[0])*16**2];
    } else if (parsedHand[0] == parsedHand[1]) {
        return [HandClass.ONE_PAIR, rankOrder.indexOf(parsedHand[0]) * 16**3 + rankOrder.indexOf(parsedHand[2]) * 16**2];
    } else if (parsedHand[1] == parsedHand[2]) {
        return [HandClass.ONE_PAIR, rankOrder.indexOf(parsedHand[1]) * 16**3 + rankOrder.indexOf(parsedHand[0]) * 16**2];
    } else {
        return [HandClass.HIGH_CARD, rankOrder.indexOf(parsedHand[0])*16**4 + rankOrder.indexOf(parsedHand[1])*16**3 + rankOrder.indexOf(parsedHand[2]) * 16 ** 2];
    }
};

export function evaluate5CardHand(hand: string[]): [HandClass,number] {
    //sort the hand to make straight & straight flush detection easier
    const parsedHand = hand.map(card => [card.slice(0,1), card.slice(1)]).toSorted(sortCards); //[rank, suit]

    //flush, royal, and straight flush detection
    if (parsedHand.filter(([_,suit]) => suit == parsedHand[0][1]).length == 5) {
        //check for royal
        if (parsedHand.filter(([rank,_]) => "TJQKA".includes(rank)).length == 5) {
            return [HandClass.ROYAL_FLUSH,0];
        } 
        //check for straight flush
        else if (rankOrder.includes(parsedHand.map(([rank, _]) => rank).join(""))) {
            return [HandClass.STRAIGHT_FLUSH,rankOrder.indexOf(parsedHand[4][0])];
        }
        //check for wheel straight flush (SPECIAL CASE)
        else if ("2345A" === parsedHand.map(([rank, _]) => rank).join("")){
            return [HandClass.STRAIGHT_FLUSH,rankOrder.indexOf('5')];
        }
        //otherwise, it's a flush
        else {
            return [HandClass.FLUSH,rankOrder.indexOf(parsedHand[4][0])*16**4 + rankOrder.indexOf(parsedHand[3][0])*16**3 + rankOrder.indexOf(parsedHand[2][0])*16**2 + rankOrder.indexOf(parsedHand[1][0])*16 + rankOrder.indexOf(parsedHand[0][0])];
        }
    }
    //straight detection
    else if (rankOrder.includes(parsedHand.map(([rank, _]) => rank).join(""))) {
        return [HandClass.STRAIGHT, rankOrder.indexOf(parsedHand[4][0])];
    }
    //check for wheel straight (SPECIAL CASE)
    else if ("2345A" === parsedHand.map(([rank, _]) => rank).join("")){
        return [HandClass.STRAIGHT,rankOrder.indexOf('5')];
    }
    //quads, boat, trips, two pair, pair detection
    else {
        const rankCounts = new Map<string, number>();
        parsedHand.forEach(([rank, _]) => {
            rankCounts.set(rank, (rankCounts.get(rank) || 0) + 1);
        });

        const counts = Array.from(rankCounts.values());
        const entries = Array.from(rankCounts.entries());

        if (counts.includes(4)) {
            return [HandClass.FOUR_OF_A_KIND,rankOrder.indexOf(entries.filter(([_, count]) => count == 4)[0][0]) * 16 + rankOrder.indexOf(entries.filter(([_, count]) => count == 1)[0][0])];
        } else if (counts.includes(3) && counts.includes(2)) {
            return [HandClass.FULL_HOUSE,rankOrder.indexOf(entries.filter(([_, count]) => count == 3)[0][0]) * 16 + rankOrder.indexOf(entries.filter(([_, count]) => count == 2)[0][0])];
        } else if (counts.includes(3)) {
            return [
                HandClass.THREE_OF_A_KIND,
                rankOrder.indexOf(entries.filter(([_, count]) => count == 3)[0][0]) * 16 * 16 
                + entries.filter(([_, count]) => count != 3).toSorted(sortRankCounts).reduce((acc, [rank, _]) => acc*16 + rankOrder.indexOf(rank), 0)
            ];
        } else if (counts.filter(c => c == 2).length == 2) {
            return [
                HandClass.TWO_PAIR,
                entries.filter(([_, count]) => count == 2).toSorted(sortRankCounts).reduce((acc, [rank, _]) => acc*16 + rankOrder.indexOf(rank), 0) * 16
                + rankOrder.indexOf(entries.filter(([_, count]) => count == 1)[0][0])
            ];
        } else if (counts.includes(2)) {
            return [
                HandClass.ONE_PAIR,
                rankOrder.indexOf(entries.filter(([_, count]) => count == 2)[0][0]) * 16**3
                + entries.filter(([_, count]) => count == 1).toSorted(sortRankCounts).reduce((acc, [rank, _]) => acc*16 + rankOrder.indexOf(rank), 0)
            ];
        }
    }

    //otherwise, high card
    return [
        HandClass.HIGH_CARD,
        parsedHand.toReversed().reduce((acc, [rank, _]) => acc*16 + rankOrder.indexOf(rank), 0)
    ];
};
