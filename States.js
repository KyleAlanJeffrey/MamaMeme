class Message {
    constructor(event) {
        this.event = event;
        this.roomID = null;
        this.playerData = null;
        this.playersData = null;
    }
}

class State {
    constructor(state, room) {
        this.timerInterval = null;
        this.duration = null;
        this.state = state;
        this.room = room;

        const msg = new Message(this.state);
        room.io.to(room.id).emit('messageFromServer', msg);
    }
    startTimer(duration) {
        const room = this.room;
        this.duration = duration
        this.timerInterval = setInterval(() => {
            if (this.duration != -1) {
                this.duration--;
            } else if (this.duration <= 0) {
                clearInterval(this.timerInterval);
                this.end();
            }
        }, 1000);
    }
    parseMessage(msg, socket) {
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
        super.parseMessage(msg, socket);
        const playerData = msg.playerData;
        const playersData = msg.playersData;
        const room = this.room;

        switch (msg.event) {
            case ('joinedServer'):
                room.addPlayer(playerData.name, playerData.lead);
                socket.join(this.id);
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
        this.room.state.startTimer(5);
    }
}

class Start extends State {
    constructor(room) {
        super('Start', room);
    }
    end() {
        super.end();
        this.room.state = new Submission(this.room);
        this.room.state.start();
        console.log('Ending start state from start class');
    }
}
class Submission extends State {
    constructor(room) {
        super('Submission', room);
    }
    start() {
        super.startTimer(100);
        this.room.sendMeme();
    }

}
module.exports = { State, Lobby, Start, Submission };