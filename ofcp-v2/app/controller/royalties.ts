import { HandClass, rankOrder } from "./hand-evaluation";

function calculate5CardRoyalties(handClass: HandClass, isMiddle: boolean) {
    switch (handClass) {
        case HandClass.ROYAL_FLUSH:
            return isMiddle ? 50 : 25;

        case HandClass.STRAIGHT_FLUSH:
            return isMiddle ? 30 : 15;

        case HandClass.FOUR_OF_A_KIND:
            return isMiddle ? 20 : 10;

        case HandClass.FULL_HOUSE:
            return isMiddle ? 12 : 6;

        case HandClass.FLUSH:
            return isMiddle ? 8 : 4;

        case HandClass.STRAIGHT:
            return isMiddle ? 4 : 2;

        case HandClass.THREE_OF_A_KIND:
            return isMiddle ? 2 : 0;

        default:
            return 0;
    }
}

export default function calculateRoyalties([frontClass, frontNumber]: [HandClass, number], [middleClass, _]: [HandClass, number], [backClass,__]: [HandClass, number]) {
    let royalties = 0;

    //calc front royalties
    if (frontClass == HandClass.THREE_OF_A_KIND) {
        //10 points for 222, 11 for 333, etc.
        royalties += frontNumber + 10;
    } else if (frontClass == HandClass.ONE_PAIR && frontNumber >= rankOrder.indexOf('6')) {
        //1 point for 66, 2 for 77, etc.
        royalties += 1 + frontNumber - rankOrder.indexOf('6');
    }

    //calc middle royalties
    royalties += calculate5CardRoyalties(middleClass, true);

    //calc back royalties
    royalties += calculate5CardRoyalties(backClass,false);
    
    return royalties;
};
