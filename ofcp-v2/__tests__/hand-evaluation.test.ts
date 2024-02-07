import { HandClass, evaluate3CardHand, evaluate5CardHand, isBust, isFantasy, rankOrder } from '@/app/controller/hand-evaluation';
import '@testing-library/jest-dom';

describe('5 Card Hand Evaluation', () => {
    it('should return a rank of royal flush and a value of 0', () => {
        const hand = [
            'Ah',
            'Kh',
            'Qh',
            'Jh',
            'Th'
        ];
        const result = evaluate5CardHand(hand);
        expect(result).toEqual([HandClass.ROYAL_FLUSH, 0]);
    });

    const straightFlushValueExpected = rankOrder.indexOf('8');

    it(`should return a rank of straight flush and a value of ${straightFlushValueExpected}`, () => {
        const hand = [
            '8h',
            '7h',
            '6h',
            '5h',
            '4h'
        ];
        const result = evaluate5CardHand(hand);
        expect(result).toEqual([HandClass.STRAIGHT_FLUSH, straightFlushValueExpected]);
    });

    const flushValueExpected = rankOrder.indexOf('A')*16**4
        + rankOrder.indexOf('7')*16**3
        + rankOrder.indexOf('6')*16**2 
        + rankOrder.indexOf('5')*16
        + rankOrder.indexOf('4');

    it(`should return a rank of flush and a value of${flushValueExpected}`, () => {
        const hand = [
            'Ah',
            '7h',
            '6h',
            '5h',
            '4h'
        ];
        const result = evaluate5CardHand(hand);
        expect(result).toEqual([HandClass.FLUSH, flushValueExpected]);
    });

    const straightValueExpected = rankOrder.indexOf('8');

    it(`should return a rank of straight and a value of ${straightValueExpected}`, () => {
        const hand = [
            '8h',
            '7h',
            '6h',
            '5h',
            '4c'
        ];
        const result = evaluate5CardHand(hand);
        expect(result).toEqual([HandClass.STRAIGHT, straightValueExpected]);
    });

    const quadsValueExpected = rankOrder.indexOf('8')*16 + rankOrder.indexOf('7');
   
    it(`should return a rank of quads and a value of ${quadsValueExpected}`, () => {
        const hand = [
            '8h',
            '8c',
            '8s',
            '8d',
            '7c'
        ];
        const result = evaluate5CardHand(hand);
        expect(result).toEqual([HandClass.FOUR_OF_A_KIND, quadsValueExpected]);
    });

    const boatValueExpected = rankOrder.indexOf('8')*16 + rankOrder.indexOf('7');
   
    it(`should return a rank of boat and a value of ${boatValueExpected}`, () => {
        const hand = [
            '8h',
            '8c',
            '8s',
            '7d',
            '7c'
        ];
        const result = evaluate5CardHand(hand);
        expect(result).toEqual([HandClass.FULL_HOUSE, boatValueExpected]);
    });

    const tripsValueExpected = rankOrder.indexOf('8')*16**2 + rankOrder.indexOf('7')*16 + rankOrder.indexOf('6');
   
    it(`should return a rank of trips and a value of ${tripsValueExpected}`, () => {
        const hand = [
            '8h',
            '8c',
            '8s',
            '7d',
            '6c'
        ];
        const result = evaluate5CardHand(hand);
        expect(result).toEqual([HandClass.THREE_OF_A_KIND, tripsValueExpected]);
    });

    const twoPairValueExpected = rankOrder.indexOf('8')*16**2 + rankOrder.indexOf('7')*16 + rankOrder.indexOf('6');

    it(`should return a rank of two pair and a value of ${twoPairValueExpected}`, () => {
        const hand = [
            '8h',
            '8c',
            '7s',
            '7d',
            '6c'
        ];
        const result = evaluate5CardHand(hand);
        expect(result).toEqual([HandClass.TWO_PAIR, twoPairValueExpected]);
    });

    const pairValueExpected = rankOrder.indexOf('8')*16**3 + rankOrder.indexOf('7')*16**2 + rankOrder.indexOf('6')*16 + rankOrder.indexOf('5');

    it(`should return a rank of pair and a value of ${pairValueExpected}`, () => {
        const hand = [
            '8h',
            '7c',
            '6s',
            '5d',
            '8c'
        ];
        const result = evaluate5CardHand(hand);
        expect(result).toEqual([HandClass.ONE_PAIR, pairValueExpected]);
    });

    const highCardValueExpected = rankOrder.indexOf('A')*16**4 + rankOrder.indexOf('7')*16**3 + rankOrder.indexOf('6')*16**2 + rankOrder.indexOf('5')*16 + rankOrder.indexOf('4');

    it(`should return a rank of high card and a value of ${highCardValueExpected}`, () => {
        const hand = [
            'Ah',
            '7c',
            '6s',
            '5d',
            '4c'
        ];
        const result = evaluate5CardHand(hand);
        expect(result).toEqual([HandClass.HIGH_CARD, highCardValueExpected]);
    });

    //test pair vs pair
    it('should show 33AKQ loses to AA234', () => {
        const hand1 = [
            '3h',
            '3c',
            'As',
            'Ks',
            'Qc'
        ];
        const hand2 = [
            'Ah',
            'Ac',
            '2s',
            '3s',
            '4c'
        ];
        const result1 = evaluate5CardHand(hand1);
        const result2 = evaluate5CardHand(hand2);
        expect(result1[1]).toBeLessThan(result2[1]);
    });

    //test wheels: straight flush and straight
    const wheelSFValueExpected = rankOrder.indexOf('5');

    it(`should return a rank of straight flush and a value of ${wheelSFValueExpected}`, () => {
        const hand = [
            '5h',
            '4h',
            '3h',
            '2h',
            'Ah'
        ];
        const result = evaluate5CardHand(hand);
        expect(result).toEqual([HandClass.STRAIGHT_FLUSH, wheelSFValueExpected]);
    });

    const wheelValueExpected = rankOrder.indexOf('5');

    it(`should return a rank of straight and a value of ${wheelValueExpected}`, () => {
        const hand = [
            '5h',
            '4h',
            '3h',
            '2h',
            'Ac'
        ];
        const result = evaluate5CardHand(hand);
        expect(result).toEqual([HandClass.STRAIGHT, wheelValueExpected]);
    });
});

describe('3 Card Hand Evaluation', () => {
    const tripsValueExpected = rankOrder.indexOf('8') * 16**2;
   
    it(`should return a rank of trips and a value of ${tripsValueExpected}`, () => {
        const hand = [
            '8h',
            '8c',
            '8s',
        ];
        const result = evaluate3CardHand(hand);
        expect(result).toEqual([HandClass.THREE_OF_A_KIND, tripsValueExpected]);
    });

    const pairValueExpected = rankOrder.indexOf('8')*16**3 + rankOrder.indexOf('6')*16**2;

    it(`should return a rank of pair and a value of ${pairValueExpected}`, () => {
        const hand = [
            '8h',
            '8c',
            '6s',
        ];
        const result = evaluate3CardHand(hand);
        expect(result).toEqual([HandClass.ONE_PAIR, pairValueExpected]);
    });

    const highCardValueExpected = rankOrder.indexOf('A')*16**4 + rankOrder.indexOf('7')*16**3 + rankOrder.indexOf('6')*16**2;

    it(`should return a rank of high card and a value of ${highCardValueExpected}`, () => {
        const hand = [
            'Ah',
            '7c',
            '6s',
        ];
        const result = evaluate3CardHand(hand);
        expect(result).toEqual([HandClass.HIGH_CARD, highCardValueExpected]);
    });
});

describe('Is Bust', () => {
    it('should return true', () => {
        const front = [
            'Ah',
            'Ac',
            '6s',
        ];
        const middle = [
            '8h',
            '7c',
            '6s',
            '5d',
            '8c'
        ];
        const back = [
            'Ah',
            '7c',
            '6s',
            '5d',
            '4c'
        ];
        const result = isBust(evaluate3CardHand(front), evaluate5CardHand(middle), evaluate5CardHand(back));
        expect(result).toBe(true);
    });

    it('should return false', () => {
        const front = [
            'Ah',
            '7c',
            '6s',
        ];
        const middle = [
            '8h',
            '7c',
            '6s',
            '5d',
            '8c'
        ];
        const back = [
            'Ah',
            '7c',
            '6s',
            '5d',
            'Ac'
        ];
        const result = isBust(evaluate3CardHand(front), evaluate5CardHand(middle), evaluate5CardHand(back));
        expect(result).toBe(false);
    });
});

describe('Is Fantasy', () => {
    it('should return true', () => {
        const front = [
            'Qh',
            'Qc',
            '6s',
        ];
        const result = isFantasy(evaluate3CardHand(front));
        expect(result).toBe(true);
    });

    it('should return false', () => {
        const front = [
            'Ah',
            '7c',
            '6s',
        ];
        const result = isFantasy(evaluate3CardHand(front));
        expect(result).toBe(false);
    });
});
