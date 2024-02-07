import { evaluate3CardHand, evaluate5CardHand } from '@/app/controller/hand-evaluation';
import calculateRoyalties from '@/app/controller/royalties';
import '@testing-library/jest-dom';

describe('Royalties', () => {
    it('should return a value of 20+25+50', () => {
        const front = [
            'Qc',
            'Qd',
            'Qs',
        ];
        const middle = [
            'Ah',
            'Kh',
            'Qh',
            'Jh',
            'Th'
        ];
        const back = [
            'Ah',
            'Kh',
            'Qh',
            'Jh',
            'Th'
        ];
        const result = calculateRoyalties(evaluate3CardHand(front), evaluate5CardHand(middle), evaluate5CardHand(back));
        expect(result).toEqual(20+25+50);
    });

    it('should return a value of 0', () => {
        const front = [
            'Qc',
            'Kd',
            'As',
        ];
        const middle = [
            '2s',
            'Kh',
            'Qh',
            'Jh',
            'Th'
        ];
        const back = [
            '2s',
            'Kh',
            'Qh',
            'Jh',
            'Th'
        ];
        const result = calculateRoyalties(evaluate3CardHand(front), evaluate5CardHand(middle), evaluate5CardHand(back));
        expect(result).toEqual(0);
    });

    it('should return a value of 8', () => {
        const front = [
            'Kc',
            'Kd',
            'As',
        ];
        const middle = [
            '2s',
            'Kh',
            'Qh',
            'Jh',
            'Th'
        ];
        const back = [
            '2s',
            'Kh',
            'Qh',
            'Jh',
            'Th'
        ];
        const result = calculateRoyalties(evaluate3CardHand(front), evaluate5CardHand(middle), evaluate5CardHand(back));
        expect(result).toEqual(8);
    });
});
