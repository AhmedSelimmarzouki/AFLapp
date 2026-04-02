const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

io.on('connection', (socket) => {
    socket.on('join-room', (data) => {
        const room = typeof data === 'string' ? data : data.roomCode;
        socket.join(room);
        socket.roomCode = room;
        socket.userName = data.name || 'Student';
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

    socket.on('send-feedback', ({ studentId, status }) => {
        io.to(studentId).emit('receive-feedback', status);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log('Server Active'));
