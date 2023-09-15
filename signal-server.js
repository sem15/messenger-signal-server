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

  //returns sessionid to frontend
  socket.on('request-sessionid', () => {
    io.to(socket.id).emit('return-sessionid', `${socket.id}`);
  });

  //sends offer to target clients
  socket.on("offer", (message) => {
    const offer = message.offer;
    let targetClient

    // Send the offer to the other client
    for(let i = 0; i < users.length; i++) {
      if(users[i] != socket.id) {
        targetClient = users[i]
        console.log("target client:", targetClient)
      }
    }

    console.log(socket.id, '=>', targetClient)
    console.log(offer)

    //This is a temporary solution for testing and will assume there is only one other client who will connect.
    io.to(targetClient).emit('offer', offer);
  });

  //sends WebRTC response back to sender
  //this will need to be updated to work with more than one client
  socket.on('offer-response', (response) => {

    console.log("offer-response:", response.answer)
    let sendBackToClient

    // Send the response to the other client
    for(let i = 0; i < users.length; i++) {
      if(users[i] != socket.id) {
        sendBackToClient = users[i]
        console.log("client response to:", sendBackToClient)
      }
    }

    io.to(sendBackToClient).emit('offer-response', response.answer);
  });

});

http.listen(3000, () => {
  console.log('listening on *:3000');
});
