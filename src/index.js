const express = require('express');
const path = require('path');
const socketio = require('socket.io');
const http = require('http');
const Filter = require('bad-words');
const { addUser, removeUser, getUser, getUsers } = require('./utils/users');
const {
    generateMessage,
    generateLocationMessage,
} = require('./utils/messages');

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

    socket.on('join', ({ username, room }, cb) => {
        const { error, user } = addUser({
            id: socket.id,
            username,
            room,
        });

        if (error) {
            return cb(error);
        }

        socket.join(user.room);

        // emitting Welcome! message for every user
        socket.emit('message', generateMessage('Welcome!'));

        // every user joins the chat, A new user has joined! displayed, but not for the user who joined
        socket.broadcast
            .to(user.room)
            .emit('message', generateMessage(`${user.username} has joined.`));
        cb();
    });

    // emitting every message for all users
    socket.on('sendMessage', (message, cb) => {
        const filter = new Filter();
        if (filter.isProfane(message)) {
            return cb('profanity is not allowed!');
        }
        io.emit('message', generateMessage(message));
        cb();
    });

    // every user leaves the chat, A user has left!
    socket.on('disconnect', () => {
        const user = removeUser(socket.id);

        if (user) {
            io.to(user.room).emit(
                'message',
                generateMessage(`${user.username} has left.`)
            );
        }
    });

    // every user shares his location
    socket.on('shareLocation', (userLocation, cb) => {
        io.emit(
            'locationMessage',
            generateLocationMessage(
                `https://google.com/maps?q=${userLocation.latitude},${userLocation.longitude}`
            )
        );
        cb();
    });
});

server.listen(port, () => {
    console.log(`server is up on port: ${port}`);
});
