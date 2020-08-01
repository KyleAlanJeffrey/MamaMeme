class Card {
    constructor(text, player) {
        this.player = player;
        this.element = ElementCreate.gameCard(text, player, 'backside');
    }
    reveal() {
        this.element.addClass('reveal-card');
        setTimeout(() => {
            this.element.removeClass('backside text-right').on('click', () => { this.clicked() })
            console.log(this.element.text());
        }, 400);
    }
    clicked() {
        if (this.player == myPlayer) return; //No Voting for self
        myPlayer.vote = this.player;
        $('.glow').removeClass('glow');
        this.element.addClass('glow');
        socket.emit('submitVote', { 'playerName': myPlayer.name, 'playerVoteName': this.player.name, 'roomID': urlExt }, (data) => {
            const playersData = data.players;
            room.endVoting(playersData);
        });
    }
}
class ElementCreate {
    static answerCard() {
        return $.parseHTML('<div class="card answer-input slide-in"><textarea name = "" id = "user-answer" cols = "30" rows = "10" placeholder = "Put your funny answer here" ></textarea ><button id="submit-answer-button" class="mbtn submit-answer slide-in" onclick="room.submitAnswer()">SUBMIT</button></div> ');
    }
    static countdownClock(text) {
        const clock = $('<div>', {
            'class': 'countdown-clock',
            'text': text
        });
        return clock;
    }
    static gameCard(text, player, classes) {
        const card = $('<div>', {
            'class': `card ${classes}`,
            'text': player.name
        });
        card.append(`<span>${text}</span>`);
        return card;

    }
    static playerCard(name, options) {
        if (options.host) name += ' (Host)';
        const card = $('<div>', {
            'class': 'player card slide-up',
            'text': name
        });
        return card;
    }
    static startButton() {
        const btn = $('<button>', {
            'class': 'mbtn start',
            'text': 'START GAME',
            id: 'start-game-button'
        });
        btn.on('click', () => { room.requestStart() });
        return btn;
    }
}