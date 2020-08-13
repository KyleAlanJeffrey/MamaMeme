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
    parseMessage(IN_MSG) {
        console.log(IN_MSG);
        switch (IN_MSG.event) {
            case ('playerLeft'): {
                room.removePlayer(IN_MSG.playerData.name);
                break;
            }
            case('Start'):{
                this.room.round = IN_MSG.round;
                break;
            }
        }
    }
    startCountdown(duration) {
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
        $('.countdown-clock').remove();
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
                if (room.myPlayer.lead) room.myPlayer.addHostPrivilege()
                else room.addWaitPrompt();
                break;

            case ('Start'):
                this.room.state = new Start(this.room);
                break;
        }
    }
}

class Start extends State {
    constructor(room) {
        super('Start', room);
        if (!room.myPlayer.lead) room.waitPrompt.remove();
        room.startRoundAnimations();
        // Do all animation stuff here

    }
    parseMessage(IN_MSG) {
        super.parseMessage(IN_MSG);
        switch (IN_MSG.event) {
            case ('Submission'):
                this.room.memes.unshift(IN_MSG.img);
                this.room.state = new Submission(this.room);
                break;
        }
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
                this.room.state = new Voting(this.room);
                break;
        }
    }
    end() {
        super.endCountdown();

    }
}
class Voting extends State {
    constructor(room) {
        super('Voting', room);
        super.startCountdown(50);
        room.loadVotingElements();
    }
    parseMessage(IN_MSG) {
        super.parseMessage(IN_MSG);
        switch (IN_MSG.event) {
            case ('Score'):
                IN_MSG.playersData.forEach((playerData) => {
                    const player = this.room.getPlayerByName(playerData.name);
                    player.roundVotes = playerData.roundVotes;
                });
                this.end();
                this.room.state = new Score(this.room);
                break;
        }
    }
    end() {
        super.endCountdown();
    }
}

class Score extends State {
    constructor(room) {
        super('Score', room);
        room.displayRoundScore();
    }
    parseMessage(IN_MSG) {
        super.parseMessage(IN_MSG);
        switch (IN_MSG.event) {
            case ('Start'): {
                this.end();
                this.room.state = new Start(this.room);
                break;
            }
            case ('Submission'):
                this.end()
                this.room.memes.unshift(IN_MSG.img);
                this.room.state = new Submission(this.room);
                break;
        }
    }
    end() {
        this.room.clearVotingElements();
    }

}