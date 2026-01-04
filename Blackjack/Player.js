export class Player {
    constructor(name, money){
        this.name = name;
        this.money = money;
        this.hand = [];
    }

    dealHand(deck){
        this.hand[0] = deck.dealCard();
        this.hand[1] = deck.dealCard();
    }

    addCard(card){
        this.hand.push(card);
    }

    valueOfHand(){
        let value = 0;
        for(let i = 0; i < this.hand.length; i++) {
            value += this.hand[i].val;
        }
        let aces = this.acesInHand();
        while (aces > 0 && value > 21) {
            value -= 10;
            aces--;
        }
        return value;
    }

    acesInHand(){
        let aces = 0;
        for(let i = 0; i < this.hand.length; i++) {
            if(this.hand[i].name == 'Ace') {
                aces++;
            }
        }
        return aces;
    }

    toString(){
        let res = '';
        if(this.hand[0] == null) return res;
        res += `Name = ${this.name}\n`;
        res += `Money = ${this.money}\n`;
        let handString = '';
        for(let i = 0; i < this.hand.length; i++){
            handString += (this.hand[i].toString());
            if(i != this.hand.length - 1)
                handString += ', ';
        }
        res += `Hand = [${handString}]`;
        return res;
    }

    clearHand(){
        this.hand = [];
    }
}