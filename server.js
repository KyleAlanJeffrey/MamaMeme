const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const fs = require('fs');

const { Room, RoomsArray, Player, PlayersArray } = require('./ServerClasses');

const PORT = process.env.PORT || 3000;
const homeURL = 'http://localhost:3000/';

// Http Server Stuff
app.use(express.static('public'));
app.get('/:id', (req, res) => {
    if (rooms.getRoomByID(req.params.id)) {
        res.sendFile(__dirname + '/public/game.html');
    } else {
        console.log('Redirecting Someone...');
        res.redirect('/');
    }
});
http.listen(PORT, () => {
    console.log('Listening on Port ' + PORT);
});





// All Socket stuff
const rooms = new RoomsArray();
rooms.addRoom(false);
rooms.print();

io.on('connection', (socket) => {

    socket.on('findServer', (callback) => {
        let room = rooms.findOpenRoom();
        if (!room) room = rooms.addRoom(false);
        const urlExt = room.id;
        callback({ 'urlExt': urlExt });
    });

    socket.on('createPrivateRoom', (callback) => {
        let room = rooms.addRoom(true);
        const urlExt = room.id;
        callback({ 'urlExt': urlExt });
    });

    socket.on('joinedServer', (data, callback) => {
        console.log(`Searching for room ${data.id}`);

        let room = rooms.getRoomByID(data.id);
        if (!room) { socket.emit('redirect', { 'url': homeURL }); return };

        let player = room.addPlayer(data.username);
        room.print();
        socket.join(room.id);

        socket.to(room.id).emit('playerJoined', player);
        callback(room.getPlayers());
    });

    socket.on('hostRequestStart', (data, callback) => {
        let room = rooms.getRoomByID(data.roomID);
        room.startGame(socket, callback);
    });
    socket.on('hostRequestStartRound', (data, callback) => {
        let room = rooms.getRoomByID(data.roomID);
        room.startRound(socket, callback);
    });
    socket.on('submitAnswer', (data, callback) => {
        let room = rooms.getRoomByID(data.roomID);
        room.answerSubmitted(data, socket, callback);

    });
    socket.on('submitVote', (data, callback) => {
        const room = rooms.getRoomByID(data.roomID);
        room.submitVote(data.playerVoteName, socket, callback);
    });
    socket.on('timeLimitReached', (data) => {
        let room = rooms.getRoomByID(data.roomID);
        room.endRound();
    });
    socket.on('leaveRoom', (data) => {
        console.log('Removing player');
        const roomID = data.id;
        const name = data.username;
        let room = rooms.getRoomByID(roomID);

        room.players.removePlayer(name);

    });
});



















