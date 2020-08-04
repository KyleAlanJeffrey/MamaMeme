class Message {
    constructor(event) {
        this.event = event;
        this.playerData = null;
        this.playersData = null;
        this.img = null;
    }
}
// STATES = {
//     LOBBY: 1,
//     START: 2,
//     SUBMISSION: 3,
//     VOTING: 4,
//     SCORE: 5,
//     RESULTS: 6
// }
class State {
    constructor(state, room) {
        this.timerInterval = null;
        this.duration = null;
        this.state = state;
        this.room = room;
    }
    /**
     * @description Starts a timeout for the state and sends a custom message to the client if specified
     * @param {*} Duration 
     * @param {*} Outgoing_Message 
     */
    start(duration, msg) {
        this.duration = duration
        if (!msg) msg = new Message(this.state);
        this.room.sendGameMessage(msg);
        if (duration == -1) return;

        this.timerInterval = setInterval(() => {
            this.duration--;
            if (this.duration <= 0) {
                clearInterval(this.timerInterval);
                this.end();
            }
        }, 1000);
    }
    /**
     * @description The supermethod for parsing client messages. Messages parsed here must do the same thing in every state i.e. when a player joins, a card is always added to the lobby.
     * @param {*} Incoming_Message 
     */
    parseMessage(msg) {
        const playerData = msg.playerData;
        const playersData = msg.playersData;
        const room = this.room;
        console.log(msg);

        switch (msg.event) {
            case ('leaveRoom'):
                // room.removePlayer(playerData.name);
                break;
        }
    }
    end() {
        clearInterval(this.timerInterval);
    }
}

class Lobby extends State {
    constructor(room) {
        super('Lobby', room);
    }
    parseMessage(msg, socket) {
        super.parseMessage(msg);
        const playerData = msg.playerData;
        const playersData = msg.playersData;
        const room = this.room;
        switch (msg.event) {
            case ('joinedServer'):
                room.addPlayer(playerData.name, playerData.lead);
                socket.join(room.id);
                // Send player who joined all players
                const msg = new Message('loadPlayers');
                msg.playersData = room.players;
                socket.emit('messageFromServer', msg);
                room.print();
                break;

            case ('hostRequestStart'):
                this.end();
                break;

            default:
                console.log(`---${EVENT} is an unspecified event!---`);
                break;
        }
    }
    end() {
        super.end()
        this.room.state = new Start(this.room);
        this.room.state.start(1, null);
        this.room.private = true;
    }
}

class Start extends State {
    constructor(room) {
        super('Start', room);
    }
    async end() {
        super.end();
        this.room.state = new Submission(this.room);
        const OUT_MSG = new Message('Submission');
        OUT_MSG.img = await this.room.getMeme();
        this.room.state.start(100, OUT_MSG);
    }
}
class Submission extends State {
    constructor(room) {
        super('Submission', room);
        this.answersSubmitted = 0;
    }
    parseMessage(IN_MSG, socket) {
        super.parseMessage(IN_MSG, socket);

        switch (IN_MSG.event) {
            case ('submitAnswer'): {
                const SERVER_PLAYER = this.room.getPlayerByName(IN_MSG.playerData.name);
                SERVER_PLAYER.addAnswer(IN_MSG.answer);
                this.answersSubmitted++;

                const OUT_MSG = new Message('answerSubmitted');
                OUT_MSG.answer = IN_MSG.answer;
                OUT_MSG.playerData = SERVER_PLAYER;
                this.room.sendGameMessage(OUT_MSG);

                if (this.answersSubmitted == this.room.players.length) this.end();
            }
        }
    }
    end() {
        super.end();
        this.room.state = new Voting(this.room);
        const OUT_MSG = new Message('Voting');
        OUT_MSG.playersData = this.room.players;
        this.room.state.start(2, OUT_MSG);
    }
}
class Voting extends State {
    constructor(room) {
        super('Voting', room);
    }
    start(duration, OUT_MSG) {
        super.start(duration, OUT_MSG);
    }
    async end() {
        this.room.state = new Submission(this.room);
        const OUT_MSG = new Message('Submission');
        OUT_MSG.img = await this.room.getMeme();
        this.room.state.start(100, OUT_MSG);
    }
}
module.exports = { State, Lobby, Start, Submission };