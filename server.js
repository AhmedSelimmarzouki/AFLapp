const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

io.on('connection', (socket) => {
    socket.on('join-room', ({ roomCode, name }) => {
        socket.join(roomCode);
        socket.roomCode = roomCode;
        socket.userName = name;
    });

    socket.on('send-question', (data) => {
        io.to(data.roomCode).emit('new-question', data.question);
    });

    socket.on('send-math', (mathData) => {
        io.to(socket.roomCode).emit('update-display', {
            id: socket.id,
            name: socket.userName,
            math: mathData
        });
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log('Running...'));
