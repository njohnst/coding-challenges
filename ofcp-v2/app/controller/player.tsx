export default class Player {
    name: string = "";
    score: number = 0;
    hand: string[] = [];
    front: string[] = [];
    middle: string[] = [];
    back: string[] = [];
    draftFront: string[] = [];
    draftMiddle: string[] = [];
    draftBack: string[] = [];

    constructor(name: string) {
        this.name = name;
    }

    setHand(hand: string[]) {
        this.hand = hand;
    }

    setScore(score: number) {
        this.score = score;
    }

    getScore() {
        return this.score;
    }

    getHand() {
        return this.hand;
    }

    getName() {
        return this.name;
    }

    getFront() {
        return this.front;
    }

    getMiddle() {
        return this.middle;
    }

    getBack() {
        return this.back;
    }   

    setFront(front: string[]) {
        this.front = front;
    }   

    setMiddle(middle: string[]) {
        this.middle = middle;
    }   

    setBack(back: string[]) {
        this.back = back;
    }

    getDraftFront() {
        return this.draftFront;
    }

    getDraftMiddle() {
        return this.draftMiddle;
    }

    getDraftBack() {
        return this.draftBack;
    }

    setDraftFront(draftFront: string[]) {
        this.draftFront = draftFront;
    }

    setDraftMiddle(draftMiddle: string[]) {
        this.draftMiddle = draftMiddle;
    }

    setDraftBack(draftBack: string[]) {
        this.draftBack = draftBack;
    }
};
