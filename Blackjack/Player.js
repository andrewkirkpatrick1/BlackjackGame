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

    addCard(deck){
        this.hand.push(deck.dealCard());
    }

    valueOfHand(){
        let value = 0;
        for(let i = 0; i < this.hand.length; i++)
            value += this.hand[i].val;
        if(this.handContainsAce() && value > 21) value -= 10;
        return value;
    }

    handContainsAce(){
        for(let i = 0; i < this.hand.length; i++)
            if(this.hand[i].name == 'Ace') return true;
        return false;
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