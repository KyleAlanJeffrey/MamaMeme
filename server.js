const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const fs = require('fs');

const { Room, RoomsArray } = require('./Room');

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
rooms.addRoom(false, io);
rooms.print();

io.on('connection', (socket) => {

    socket.on('findServer', (callback) => {
        let room = rooms.findOpenRoom();
        if (!room) room = rooms.addRoom(false, io);
        const urlExt = room.id;
        callback({ 'urlExt': urlExt });
    });

    socket.on('createPrivateRoom', (callback) => {
        let room = rooms.addRoom(true, io);
        const urlExt = room.id;
        callback({ 'urlExt': urlExt });
    });

    socket.on('messageFromClient', (data) => {
        const room = rooms.getRoomByID(data.roomID);
        if (!room) { socket.emit('redirect', { 'url': homeURL }); return };
        room.parseMessage(data, socket);
    })

});



















