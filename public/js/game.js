const STAGES = {
    LOBBY: 1,
    START: 2,
    INPUT: 3,
    VOTING: 4
}
class ElementCreate {
    constructor() {

    }
    static gameCard(text) {
        return $.parseHTML(`<div class="card"><span>${text}</span></div>`);

    }
    static playerCard(name) {
        return $.parseHTML(`<div class="player card slide-up">${name}</div>`);
    }
    static startButton() {
        return $.parseHTML('<button class="mbtn start">START GAME</button>');
    }
}
class Player {
    constructor(name, card) {
        this.name = name;
        this.cardElement = card;
        this.lead = false;
    }
    addHostPrivilege(board) {
        let startBtn = ElementCreate.startButton();
        board.append(startBtn);
    }

}

class Room {
    constructor(playerListElement, boardElement) {
        this.players = [];
        this.playerListElement = playerListElement;
        this.boardElement = boardElement;
        this.stage = STAGES.LOBBY;

    }
    addPlayer(name, lead) {
        let card = ElementCreate.playerCard(name);
        this.playerListElement.append(card);
        let player = new Player(name, card);
        if (lead) player.lead = true;
        this.players.push(player);
        return player;
    }
}