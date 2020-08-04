const urlExt = window.location.href.split('/')[3];
// STATES = {
//     LOBBY: 1,
//     START: 2,
//     SUBMISSION: 3,
//     VOTING: 4,
//     SCORE: 5,
//     RESULTS: 6
// }
const LISTEN_EVENT = {
    PLAYER_JOINED: 'playerJoined',
    LOAD_PLAYERS: 'loadPlayers'
}

class Message {
    constructor(event) {
        let me = { ...room.myPlayer };
        me.submissionCard = null;
        me.answerCard = null;
        this.event = event;
        this.roomID = urlExt;
        this.playerData = me;
        this.playersData = null
    }
}

class Player {
    constructor(name, card, lead) {
        this.name = name;
        this.submissionCard = card;
        this.lead = lead;
        this.vote = undefined;
        this.answerCard = undefined;
        this.points = 0;
    }
    addHostPrivilege() {
        console.log('You are the host!')
        let startBtn = ElementCreate.startButton();
        $('.game-content').append(startBtn);
    }

}

class Room {
    constructor(socket) {
        this.players = [];
        this.socket = socket;
        this.myPlayer = null;
        this.myUsername = getCookie('username');
        this.$board = $('.game-content');
        this.memes = [];
        this.state = new Lobby(this);
    }

    addPlayer(name, lead) {
        const playerCard = ElementCreate.playerCard(name, { host: lead });
        $('.players').append(playerCard);
        let player = new Player(name, playerCard, lead);
        this.players.push(player);
        return player;
    }
    findPlayerByName(name) {
        return this.players.find((player) => {
            return player.name == name;
        });
    }
    requestStart() {
        $('#start-game-button').hide();
        const OUT_MSG = new Message('hostRequestStart');
        this.sendServerMessage(OUT_MSG);
    }
    submitAnswer() {
        const OUT_MSG = new Message('submitAnswer');
        OUT_MSG.answer = $('#user-answer').val();
        $('.card.answer-input').remove();
        this.sendServerMessage(OUT_MSG);
    }
    parseMessage(message) {
        this.state.parseMessage(message)
    }
    loadSubmissionElements() {
        $('.meme-format-container').append(ElementCreate.meme(this.memes[0]));
        this.$board.append(ElementCreate.answerCard());
    }
    clearSubmissionElements() {
        $('.countdown-clock').remove();
    }
    addHiddenSubmission(answer, playerName) {
        let player = this.findPlayerByName(playerName);
        let card = new Card(answer, player, this);
        player.submissionCard = card;
        $('.meme-answer-container').append(card.element);
        $('.vote-prompt').removeClass('hidden');
    }
    loadVotingElements() {
        let t = 500, dt = 2000;
        this.players.forEach((player) => {
            setTimeout(() => {
                player.submissionCard.reveal();
            }, t);
            t += dt;
        });
    }
    clearVotingElements() {
        $('.meme-format').remove();
        $('.countdown-clock').remove();
        $('.reveal-card').remove();
        $('.vote-prompt').addClass('hidden');
    }
    sendServerMessage(OUT_MSG) {
        this.socket.emit('messageFromClient', OUT_MSG);
    }

}
