const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

const questionBank = {};

io.on('connection', (socket) => {

    socket.on('join-room', (data) => {
        const room = typeof data === 'string' ? data : data.roomCode;
        socket.join(room);
        socket.roomCode = room;
        socket.userName = data.name || 'Student';
        socket.to(room).emit('student-joined', { id: socket.id, name: socket.userName });
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

    socket.on('save-question', ({ chapter, text }) => {
        if (!questionBank[chapter]) questionBank[chapter] = [];
        const id = Date.now().toString();
        questionBank[chapter].push({ id, text });
        socket.emit('question-bank-update', questionBank);
    });

    socket.on('delete-question', ({ chapter, id }) => {
        if (questionBank[chapter]) {
            questionBank[chapter] = questionBank[chapter].filter(q => q.id !== id);
            if (questionBank[chapter].length === 0) delete questionBank[chapter];
        }
        socket.emit('question-bank-update', questionBank);
    });

    socket.on('get-question-bank', () => {
        socket.emit('question-bank-update', questionBank);
    });

    socket.on('disconnect', () => {
        if (socket.roomCode) {
            io.to(socket.roomCode).emit('student-left', { id: socket.id });
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server active on port ${PORT}`));
