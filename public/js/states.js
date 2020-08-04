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
        this.state = state;
        this.room = room;
    }
    parseMessage(msg) {
        console.log(msg);
    }
    startCountdown(duration) {
        if (this.duration == -1) return;

        this.countdownClock = ElementCreate.countdownClock(duration);
        this.room.$board.append(this.countdownClock);

        this.countdown = duration;
        this.countInterval = setInterval(() => {
            this.countdown--;
            this.countdownClock.text(this.countdown);
            if (this.countdown <= 0) {
                clearInterval(this.countInterval);
            }
        }, 1000);

    }
    endCountdown() {
        clearInterval(this.countInterval);
    }
}

class Lobby extends State {
    constructor(room) {
        super('Lobby', room);
    }
    parseMessage(msg) {
        const room = this.room;
        const playerData = msg.playerData;
        const playersData = msg.playersData;
        super.parseMessage(msg);
        switch (msg.event) {
            case ('playerJoined'):
                room.addPlayer(playerData.name, playerData.lead);
                break;

            case ('loadPlayers'):
                playersData.forEach(playerData => {
                    let player = room.addPlayer(playerData.name, playerData.lead);
                    if (player.name == room.myUsername) room.myPlayer = player;
                });
                if (room.myPlayer.lead) room.myPlayer.addHostPrivilege();
                break;

            case ('Start'):
                this.end();
                break;

            default:
                console.log(`---${EVENT} is an unspecified event!---`);
                break;
        }
    }
    end() {
        this.room.state = new Start(this.room);
    }
}

class Start extends State {
    constructor(room) {
        super('Start', room);
        // Do all animation stuff here

    }
    parseMessage(msg) {
        super.parseMessage(msg);
        switch (msg.event) {
            case ('Submission'):
                this.room.memes.unshift(msg.img);
                this.end();
                break;
        }
    }
    end() {
        this.room.state = new Submission(this.room);
        // this.room.state.startCountdown(100);
        // console.log('Ending start state from start class');
    }
}
class Submission extends State {
    constructor(room) {
        super('Submission', room);
        room.loadSubmissionElements();
        super.startCountdown(100);
    }
    parseMessage(IN_MSG) {
        super.parseMessage(IN_MSG);
        switch (IN_MSG.event) {
            case ('answerSubmitted'):
                this.room.addHiddenSubmission(IN_MSG.answer, IN_MSG.playerData.name);
                break;
            case ('Voting'):
                this.end();
                break;
        }
    }
    end() {
        super.endCountdown();
        room.clearSubmissionElements();
        this.room.state = new Voting(this.room);
        this.room.state.startCountdown(30);
    }
}
class Voting extends State {
    constructor(room) {
        super('Voting', room);
        room.loadVotingElements();
    }
    parseMessage(IN_MSG) {
        super.parseMessage(IN_MSG);
        switch (IN_MSG.event) {
            case ('Submission'):
                this.room.memes.unshift(IN_MSG.img);
                this.end();
                break;
        }
    }
    end() {
        this.room.clearVotingElements();
        this.room.state = new Submission(this.room);
        super.endCountdown();
    }
}