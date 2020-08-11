const fs = require('fs');
const { State, Lobby, Start, Submission } = require('./States');

const POINT_MULTIPLIER = 100;

const EMIT_EVENT = {
    PLAYER_JOINED: 'playerJoined',
    LOAD_PLAYERS: 'loadPlayers'
}

class Message {
    constructor(event) {
        this.event = event;
        this.roomID = null;
        this.playerData = null;
        this.playersData = null;
    }
}

class Room {
    constructor(id, isPrivate, io) {
        this.id = id;
        this.private = isPrivate;
        this.full = false;
        this.players = [];
        this.io = io;
        this.ROOM_SIZE = 8;
        this.state = new Lobby(this);
        this.memes = [];
    }
    getPlayerByName(name) {
        return this.players.find((player) => {
            return player.name == name;
        });
    }
    addPlayer(username, socket) {
        let player = new Player(username, socket);
        this.players.push(player);
        if (this.players.length == this.ROOM_SIZE) this.full = true;
        if (this.players.length == 1) player.lead = true;
        //Create server message to client
        let message = new Message('playerJoined');
        message.playerData = player;
        //Send message to clients in room
        this.io.to(this.id).emit('messageFromServer', message);
    }
    removePlayer(name) {
        this.players = this.players.filter((player) => {
            return player.name != name;
        });
    }
    parseMessage(data, socket) {
        this.state.parseMessage(data, socket);
    }
    getMeme() {
        let m_num = Math.floor(25 * Math.random());
        this.memes.push(m_num);
        return new Promise((res, rej) => {
            fs.readFile(`./img/${m_num}.jpg`, (err, data) => {
                res('data:image/png;base64,' + data.toString('base64'));
            });
        });
    }
    sendGameMessage(msg) {
        this.io.to(this.id).emit('messageFromServer', msg);
    }
    resetVotes() {
        this.players.forEach((player) => {
            player.roundVotes = 0;
        });
    }
    addVote(playerData) {
        let votedPlayer = this.getPlayerByName(playerData.vote.name);
        votedPlayer.addVote();
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
        return !this.private && !this.full && (this.players.length <= this.ROOM_SIZE);
    }
    print() {
        console.log(`***********************\nRoom ID: ${this.id}\nPrivate Room: ${this.private}\nJoinable: ${this.joinable()}\nPlayers: ${this.players.length}\n***********************`);
    }
}

class Player {
    constructor(name, socket) {
        this.name = name;
        this.lead = false;
        this.points = 0;
        this.socket = socket;
        this.answers = [];
        this.roundVotes = 0;
    }
    addVote() {
        this.points += POINT_MULTIPLIER;
        this.roundVotes++;
    }
    addAnswer(answer) {
        this.answers.unshift(answer);
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
    addRoom(privateRoom, io) {
        // Generate unique room code and check if it's unique
        let id = Room.createID();
        while (this.getRoomByID(id)) {
            id = Room.createID();
        }
        let room = new Room(id, privateRoom, io);
        this.roomList.push(room);
        console.log(`--------Creating new room for Ext ${id}-------- `);
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

module.exports = { Room, RoomsArray, Message };