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
        socket.userName = name;
        socket.roomCode = roomCode;
        console.log(`${name} joined ${roomCode}`);
    });

    socket.on('send-question', ({ roomCode, question }) => {
        socket.to(roomCode).emit('new-question', question);
    });

    socket.on('send-math', (data) => {
        // Validation to ensure data exists before emitting
        if (socket.roomCode) {
            io.to(socket.roomCode).emit('update-display', {
                id: socket.id,
                name: socket.userName,
                math: data
            });
        }
    });

    socket.on('send-feedback', ({ studentId, status }) => {
        io.to(studentId).emit('receive-feedback', status);
    });
});

// --- THE CRITICAL FIX FOR RENDER ---
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ SERVER LIVE ON PORT ${PORT}`);
});
