const express = require('express');
const path = require('path');
const socketio = require('socket.io');
const http = require('http');
const Filter = require('bad-words');

const app = express();
// creating server with http to pass it for socketio function
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;

const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));

// using on connection event from socketio
io.on('connection', (socket) => {
    console.log('New WebSocket connection');

    // emitting Welcome! message for every user
    socket.emit('message', 'Welcome!');

    // every user joins the chat, A new user has joined! displayed, but not for the user who joined
    socket.broadcast.emit('message', 'A new user has joined!');

    // emitting every message for all users
    socket.on('sendMessage', (message, cb) => {
        const filter = new Filter();
        if (filter.isProfane(message)) {
            return cb('profanity is not allowed!');
        }
        io.emit('message', message);
        cb();
    });

    // every user leaves the chat, A user has left!
    socket.on('disconnect', () => {
        io.emit('message', 'A user has left!');
    });

    // every user shares his location
    socket.on('shareLocation', (userLocation, cb) => {
        io.emit(
            'locationMessage',
            `https://google.com/maps?q=${userLocation.latitude},${userLocation.longitude}`
        );
        cb();
    });
});

server.listen(port, () => {
    console.log(`server is up on port: ${port}`);
});
