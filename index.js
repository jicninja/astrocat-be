const express = require("express");
const { createServer } = require("http");
const path = require('path');

const port = process.env.PORT || 3000;

const app = express();
const server = createServer(app);

app.use(express.static('public'));

app.get('/',function(req,res) {
  res.sendFile(path.join(__dirname+'/public/index.html'));
});

const io = require('socket.io')(server, {
  cors: {
    origin: '*'
  }    
});

io.use((socket, next) => {
    if (socket.handshake.query.token === "UNITY") {
        next();
    } else {
        next(new Error("Authentication error"));
    }
});

io.on('connection', socket => {
    socket.emit('newUser', { PlayerId: socket.id });

    socket.on('userMove', (data) => {
      socket.emit('userMove',{ PlayerId: socket.id }, data);
    });

});


server.listen(port);
console.log('listening on *:' + port);