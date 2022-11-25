const express = require('express');
const path = require('path');
const socketio = require('socket.io');
const http = require('http');

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
    socket.emit('message', 'Welcome!');

    socket.broadcast.emit('message', 'A new user has joined!');

    socket.on('sendMessage', (message) => {
        io.emit('message', message);
    });
    socket.on('disconnect', () => {
        io.emit('message', 'A user has left!');
    });
});

server.listen(port, () => {
    console.log(`server is up on port: ${port}`);
});
