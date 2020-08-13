class WaitPrompt {
    constructor() {
        const element = $('<h1>', {
            'class': 'waiting-prompt'
        });
        this.element = element;
        $('.game-display').append(this.element);
        this.n = 0;
        this.interval = setInterval(() => {
            this.n++;
            const text = 'Waiting on Host';
            let dots = '';
            for (let i = 0; i < this.n; i++) {
                dots += '.';
            }
            if (this.n == 3) this.n = -1;
            this.element.text(text + dots);
        }, 300);
    }
    remove() {
        clearInterval(this.interval);
        this.element.remove();
    }
}
class Card {
    constructor(text, player, room) {
        this.room = room;
        this.player = player;
        this.element = ElementCreate.gameCard(player.name, 'backside');
        this.answer = text;
    }
    reveal() {
        const element = this.element;
        setTimeout(() => {
            element.removeClass('backside text-right').on('click', () => { this.clicked() });
            element.children('.name').remove();
        }, 300)
        element.append(`<textarea readonly cols="30" rows="10">${this.answer}</textarea>`);
        element.addClass('reveal-card');

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
    static resultCard(name) {
        const player = $('<div>', {
            'class': 'player'
        });
        const card = $('<div>', {
            'class': 'card',
            'text': name,
            'id': name + 'result-card',
        });
        const h1 = $('<h1>', {
            'text': '0',
        });
        player.append(card);
        card.append(h1);
        return player;
    }
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
        });
        card.append(`<div class="name">${text}</span>`);
        return card;

    }
    static playerCard(name, options) {
        if (options.host) name += ' (Host)';
        const card = $('<div>', {
            'class': 'player card slide-up',
            'text': name
        });
        const span = $('<span>', {
            'text': 'Score: ' + options.score,
        })
        card.append(span);
        setTimeout(() => { card.removeClass('slide-up'); }, 2000);
        return card;
    }
    static startButton() {
        const btn = $('<button>', {
            'class': 'mbtn start',
            'text': 'START GAME',
            id: 'start-game-button'
        });
        btn.click(() => { room.requestStart(); })
            .mouseover(() => { document.getElementById('blip2_audio').play(); })
            .mousedown(() => { document.getElementById('blip3_audio').play(); });
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
    static roundTitle(number) {
        const title = $.parseHTML(`<div class="round-title"> Round ${number} </div>`);
        return title;
    }
}