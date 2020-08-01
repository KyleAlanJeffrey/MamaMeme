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
            default:
                console.log(`---${EVENT} is an unspecified event!---`);
                break;
        }
    }
    end() {
        this.room.state = new Submission(this.room);
        // console.log('Ending start state from start class');
    }
}
class Submission extends State {
    constructor(room) {
        super('Submission', room);
        room.startCountdown(100);
        room.loadSubmissionElements();
    }

}