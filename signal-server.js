const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.get('/', (req, res) => {
    res.send('Signal Server is running');
});

io.on('connection', (socket) => {
    console.log('A user connected: ' + socket.id);

    // Listen to signaling data from the client
    socket.on('send-signal', (data) => {
        // Broadcast signaling data to all other clients
        socket.broadcast.emit('receive-signal', data);
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected: ' + socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Signal Server is running on http://localhost:${PORT}`);
});