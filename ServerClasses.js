const fs = require('fs');
const ROOM_SIZE = 8;

class Room {
    constructor(id) {
        this.id = id;
        this.private = false;
        this.full = false;
        this.players = new PlayersArray();
        this.answersSubmitted = 0;
    }
    addPlayer(username, ip) {
        let player = this.players.addPlayer(username, ip);
        if (this.players.length == ROOM_SIZE) this.full = true;
        if (this.players.length == 1) player.lead = true;
        return player;
    }
    getPlayers() {
        return this.players.playerList;
    }
    answerSubmitted(data, socket,callback){
        this.answersSubmitted++;
        socket.to(data.roomID).emit('answerSubmitted', { 'answer': data.answer, 'playerName': data.playerName });
        if(this.answersSubmitted == this.players.length){
            socket.to(data.roomID).emit('endRound');
            callback();
        }
    }
    startGame(socket, callback) {
        console.log(`Starting game in room ${this.id}...`);
        this.private = true;
        let m_num = Math.floor(12*Math.random());
        console.log(`Sending meme ${m_num}`);
        fs.readFile(`./img/${m_num}.jpg`, (err, data) => {
            socket.to(this.id).emit('startGame', { 'image': 'data:image/png;base64,' + data.toString('base64') });
            callback({ 'image': 'data:image/JPG;base64,' + data.toString('base64') });
        });
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
    addRoom(privateRoom) {
        // Generate unique room code and check if it's unique
        let id = Room.createID();
        while (this.getRoomByID(id)) {
            id = Room.createID();
        }
        let room = new Room(id, privateRoom);
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
class Player {
    constructor(name, ip) {
        this.username = name;
        this.ip = ip;
        this.lead = false;
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
    findByName(name) {
        let player = this.playerList.find((player) => {
            return player.username == name;
        });
        if (player == undefined) player = false;
        return player;
    }
    addPlayer(name, ip) {
        let player = new Player(name, ip);
        this.playerList.push(player);
        this.length++;
        return player;
    }
    removePlayer(name) {
        this.playerList = this.playerList.filter((player) => {
            return player.username != name;
        });
        this.length--;
    }
}


module.exports = { PlayersArray, Player, RoomsArray, Room };