class Card {
    constructor(text, player, room) {
        this.room = room;
        this.player = player;
        this.element = ElementCreate.gameCard(player.name, 'backside');
        this.answer = text;
    }
    reveal() {
        this.element.addClass('reveal-card');
        setTimeout(() => {
            this.element.removeClass('backside text-right').on('click', () => { this.clicked() });
            this.element.text(this.answer);
        }, 400);
    }
    clicked() {
        // if (this.player == this.room.myPlayer) return; //No Voting for self
        this.clickable = false;
        this.room.myPlayer.vote = { name: this.player.name };
        this.element.addClass('glow');
        const OUT_MSG = new Message('submitVote');
        this.room.sendServerMessage(OUT_MSG);
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
    static gameCard(text, classes) {
        const card = $('<div>', {
            'class': `card ${classes}`,
            'text': text
        });
        // card.append(`<span>${text}</span>`);
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
    static meme(image) {
        const meme = $('<div>', {
            'class': 'meme-format card-toss',
        });
        const img = $('<img>', {
            'src': image,
        });
        meme.append(img);
        return meme;
    }
}