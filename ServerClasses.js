const ROOM_SIZE = 8;
class Room {
    constructor(id) {
        this.id = id;
        this.private = false;
        this.full = false;
        this.players = new PlayersArray();
    }
    addPlayer(username, ip) {
        this.players.addPlayer(username, ip);
        if(this.players.length == ROOM_SIZE) this.full = true;
    }
    static createID() {
        let A = 65;
        let Z = 90;
        let roomCode = '';
        for (let i = 0; i < 4; i++) {
            let ch_code = Math.floor(((Z - A) * Math.random())) + A;
            let ch = String.fromCharCode(ch_code);
            roomCode += ch;
        }
        return roomCode;
    }
    joinable() {
        return !this.private && !this.full && (this.players.length <= ROOM_SIZE);
    }
    print() {
        console.log(`***********************\nRoom ID: ${this.id}\nPrivate Room: ${this.private}\nJoinable: ${this.joinable()}\nPlayers: ${this.players.length}\n***********************`);
    }
}
class RoomsArray {
    constructor() {
        this.roomList = [];
    }
    getRoomByID(id) {
        let room = this.roomList.find((room) => {
            return room.id == id;
        });
        if (room == undefined) room = false;
        return room;
    }
    addRoom() {
        // Generate unique room code and check if it's unique
        let id = Room.createID();
        while (this.getRoomByID(id)) {
            id = Room.createID();
        }
        let room = new Room(id);
        this.roomList.push(room);
        return room;
    }
    findOpenRoom() {
        let room = this.roomList.find((room) => {
            return room.joinable() == true;
        });
        if (room == undefined) room = false;
        return room;
    }
    print() {
        console.log('----------------------------\n\tROOMS LIST\n----------------------------');
        this.roomList.forEach((room) => {
            room.print();
        });
    }
}
class Player {
    constructor(name, ip) {
        this.username = name;
        this.ip = ip;
    }
}
class PlayersArray {
    constructor() {
        this.playerList = [];
        this.length = 0;
    }
    findByIP(ip) {
        this.playerList.find((player) => {
            return player.ip == ip;
        })
    }
    addPlayer(name, ip) {
        this.playerList.push(new Player(name, ip));
        this.length++;
    }
}


module.exports = { PlayersArray, Player, RoomsArray, Room };