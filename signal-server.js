const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  cors: {
    origins: ['http://localhost:8080', 'http://messenger-frontend.s3-website-us-east-1.amazonaws.com/']
  }
});

//working stun: stun:3.90.174.173:3478
//turn is running too on same port just need to test

const users = []

app.get('/', (req, res) => {
  res.send('<h1>Hey Socket.io</h1>');
});

io.on('connection', (socket) => {
  console.log('a user connected');
  users.push(socket.id)
  console.log("Number of active connections is now:", users.length)

  socket.on('disconnect', () => {
    let index = users.indexOf(socket.id);
    if (index > -1) {
      users.splice(index, 1);
    }
    console.log('user disconnected');
    console.log("Number of active connections is now:", users.length)
  });

  socket.on('my message', (msg) => {
    console.log('message: ' + msg);
  });

  socket.on('my message', (msg) => {
    io.emit('my broadcast', `server: ${msg}`);
  });

  socket.on('request-sessionid', () => {
    io.to(socket.id).emit('return-sessionid', `${socket.id}`);
  });

  socket.on("offer", (message) => {
    const offer = message.offer;
    console.log(offer)

    // Send the offer to the other client
    const otherClientSocket = Object.keys(io.engine.clients)
    console.log("client(s)", otherClientSocket)
    // otherClientSocket.emit("offer", offer);
  });

});

http.listen(3000, () => {
  console.log('listening on *:3000');
});
