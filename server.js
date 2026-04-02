const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

io.on('connection', (socket) => {
    socket.on('join-room', (room) => {
        socket.join(room);
    });

    socket.on('send-question', ({ room, question }) => {
        io.to(room).emit('new-question', question);
    });

    socket.on('drawing', ({ room, drawing }) => {
        io.to(room).emit('new-drawing', drawing);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log('Server running on port ' + PORT));
