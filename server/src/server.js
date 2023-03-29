const path = require("path");
const express = require("express");
const app = express();
const PORT = process.env.PORT || 2000;
const http = require('http');

// Set static folder
app.use(express.static(path.join(__dirname, "../public")));

const server = http.createServer(app);
const io = require('socket.io')(server);

// Track the joining users
let users = [];

// When a client connects
io.on('connection', socket => {

    console.log('Client connected');
    // We will respond from the server and welcome the user
    socket.emit('message', 'Welcome to my simple chat app');

    socket.on('userJoin', message => {
        // object deconstruction
        const { user } = JSON.parse(message);
        newUser(user, socket, io);
    });

    socket.on('chatMessage', chatMessage => {
        const data = JSON.parse(chatMessage);
        console.log(chatMessage);
        io.sockets.emit('chatMessageBroadcast', JSON.stringify({
            chatMessage:data
        }))
    });

    socket.on('disconnect', () => {
        users = users.filter(u => u.id != socket.id);
        io.sockets.emit('userDisconnect', JSON.stringify({
            id: socket.id
        }));
    });
});

const newUser = (user, socket, io) => {
    users.push({ user, id: socket.id });
    console.log(users);
    socket.emit('userJoined', 'You are now joined');
    io.sockets.emit('userList', JSON.stringify({
        user, users
    }));
}

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
