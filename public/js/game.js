const STAGES = {
    LOBBY: 1,
    START: 2,
    WRITE_ANSWERS: 3,
    VOTING: 4
}
const CARD_REVEAL_INTERVAL = 2000;
const ROUND_TIME = 100;

class ElementCreate {
    constructor() {

    }
    static answerCard() {
        return $.parseHTML('<div class="card answer-input slide-in"><textarea name = "" id = "user-answer" cols = "30" rows = "10" placeholder = "Put your funny answer here" ></textarea ><button id="submit-answer-button" class="mbtn submit-answer slide-in" onclick="submitAnswer()">SUBMIT</button></div> ');
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
        btn.on('click', () => { requestStartGame() });
        return btn;
    }
}
class Player {
    constructor(name, card) {
        this.name = name;
        this.cardElement = card;
        this.lead = false;
        this.vote = undefined;
        this.answerCard = undefined;
        this.points = 0;
    }
    addHostPrivilege(board) {
        this.lead = true;
        console.log('You are the host!')
        let startBtn = ElementCreate.startButton();
        board.append(startBtn);
    }

}
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
        socket.emit('submitVote', { 'playerName': myPlayer.name, 'playerVoteName': this.player.name, 'roomID': urlExt },(data)=>{
            const playersData = data.players;
            room.endVoting(playersData);
        });
    }
}
class Room {
    constructor(playerListElement, boardElement, memeContainerElement, memeAnswersElement) {
        this.players = [];
        this.$playerList = playerListElement;
        this.$board = boardElement;
        this.$memeContainer = memeContainerElement;
        this.$memeImage = $('.meme-format img');
        this.$memeAnswers = memeAnswersElement;
        this.stage = STAGES.LOBBY;

    }
    addPlayer(name, lead) {
        let card = ElementCreate.playerCard(name, { host: lead });
        this.$playerList.append(card);
        let player = new Player(name, card);
        if (lead) player.lead = true;
        this.players.push(player);
        return player;
    }
    startGame(meme) {
        this.stage = STAGES.START;
        this.startRound(meme);
    }
    loadMeme(img) {
        this.$memeImage.removeClass('hidden');
        $('.meme-format').addClass('card-toss');
        this.$memeContainer.attr('src', img);

        setTimeout(() => { $('.meme-format').removeClass('card-toss'); }, 2000);
    }
    addHiddenAnswer(text, playerName) {
        let player = this.findPlayerByName(playerName);
        let card = new Card(text, player);
        player.answerCard = card;
        this.$memeAnswers.append(card.element);
    }
    startRound(meme) {
        $('.reveal-card').remove()
        this.$memeImage.addClass('hidden');

        this.stage = STAGES.WRITE_ANSWERS;
        const countdownClock = ElementCreate.countdownClock(ROUND_TIME);
        this.$board.append(countdownClock);
        this.startCountDown(ROUND_TIME, countdownClock);

        this.$board.append(ElementCreate.answerCard());


        this.loadMeme(meme);
    }
    startCountDown(seconds, countdownElement) {
        this.countdown = seconds;
        const I = setInterval(() => {
            this.countdown--;
            countdownElement.text(this.countdown);
            if (this.countdown < 0) {
                clearInterval(I);
                // if (myPlayer.lead) socket.emit('timeLimitReached', { 'roomID': urlExt });
            }
        }, 1000);
    }
    endVoting(playersData) {
        $('.vote-prompt').addClass('hidden');
        let t = 0, dt = 2000;
        playersData.forEach((playerData) => {
            console.log(playerData)
            let player = room.findPlayerByName(playerData.username);
            player.points = playerData.points;
        });
        setTimeout(() => {
            if (myPlayer.lead) {
                socket.emit('hostRequestStartRound', { 'roomID': urlExt }, (data) => {
                    memes.unshift(data.image);
                    room.startRound(memes[0]);
                });
            }
        }, t);
    }
    endRound() {
        this.stage = STAGES.VOTING;
        $('.countdown-clock').remove();
        $('.vote-prompt').removeClass('hidden');

        //Reveal all answers 1 by 1
        let t = 0, dt = CARD_REVEAL_INTERVAL;
        this.players.forEach((player) => {
            setTimeout(() => {
                player.answerCard.reveal();
            }, t);
            t += dt;
        });
        //Now wait for voting to end
    }
    findPlayerByName(name) {
        return this.players.find((player) => {
            return player.name == name;
        });
    }
}