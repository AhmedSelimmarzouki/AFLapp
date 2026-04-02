const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

io.on('connection', (socket) => {
    // 1. Join Room
    socket.on('join-room', ({ roomCode, name }) => {
        socket.join(roomCode);
        socket.userName = name;
        socket.roomCode = roomCode;
        console.log(`${name} joined room ${roomCode}`);
    });

    // 2. Teacher pushes question/sketch to Students
    socket.on('send-question', ({ roomCode, question }) => {
        io.to(roomCode).emit('new-question', question);
    });

    // 3. Student sends math/drawing back to Teacher
    socket.on('send-math', (mathData) => {
        io.to(socket.roomCode).emit('update-display', {
            id: socket.id,
            name: socket.userName,
            math: mathData
        });
    });

    // 4. Teacher sends Feedback (Thumbs up/down)
    socket.on('send-feedback', ({ studentId, status }) => {
        io.to(studentId).emit('receive-feedback', status);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log('AFL Server running on port ' + PORT));
