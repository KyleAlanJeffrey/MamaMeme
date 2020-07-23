const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const { Room, RoomsArray, Player, PlayersArray } = require('./ServerClasses');

const PORT = process.env.PORT || 3000;


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
rooms.addRoom();
rooms.print();

io.on('connection', (socket) => {
    console.log('Someone Connected to a socket');

    socket.on('findServer', (callback) => {
        let room = rooms.findOpenRoom();
        if(!room) room = rooms.addRoom();
        const urlExt = room.id;
        callback({ 'urlExt': urlExt });
    });

    socket.on('joinedServer', (data) => {
        console.log(`Searching for room ${data.id}`);
        let room = rooms.getRoomByID(data.id);
        const ip = socket.handshake.address;
        room.addPlayer(data.username, socket.handshake.address);
        room.print();

    });
});


















