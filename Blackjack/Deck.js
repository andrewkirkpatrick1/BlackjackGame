import {Card} from './Card.js';

export class Deck {
    constructor(){
        this.contents = [];
        for(let suit = 0; suit < 4; suit++){
            for(let value = 0; value < 13; value++){
                this.contents.push(new Card(suit, value + 2));
            }
        }
    }

    shuffle(){
        let randCard;
        let temp;
        let tempDeck = new Deck();
        this.contents = tempDeck.contents;
        for(let i = 0; i < 52; i++){
                randCard = Math.floor(Math.random() * 52);
                temp = new Card(this.contents[i].suit, this.contents[i].name);
                this.contents[i] = this.contents[randCard];
                this.contents[randCard] = temp;
        }
    }

    dealCard(){
        return this.contents.pop();
    }

    toString(){
        let res = '';

        for(let i = 0; i < this.contents.length; i++){
            res += `${this.contents[i].toString()}\n`;
        }
        return res;
    }

    isEmpty(){
        return this.contents.length == 0;
    }
}