const express = require('express');
const { createServer, get } = require('http');
const { addPlayer, getOtherPlayers, getPlayer, editPlayer, deletePlayer } = require('./modules/playerCache');
const path = require('path');

const app = express();
const server = createServer(app);

const port = process.env.PORT || 3000;

/* STATIC SERVER - Landing Page */
app.use(express.static('public'));
app.get('/',function(req,res) {
  res.sendFile(path.join(__dirname+'/public/index.html'));
});

/* RealTime Server */
const io = require('socket.io')(server, {
  cors: {
    origin: '*'
  }    
});

/* Authentication */
io.use((socket, next) => {
    if (socket.handshake.query.token === 'UNITY') {
        next();
    } else {
        next(new Error('Authentication error'));
    }
});

/* On Connect */
io.on('connection', socket => {
  const { id } = socket;

  /* Add player cache */
  addPlayer(id, { position : 0 });

  /* Emit existing user */
  const otherUsers = getOtherPlayers(id);
  if(otherUsers.length) {
    socket.emit('existingUsers', otherUsers);
  }
  
  /*  Broadcast new user */
  socket.broadcast.emit('newUser', socket.id);
    socket.on('moveUser', data => { 
      const currentPlayer = getPlayer(id);
      if(currentPlayer.position != data) {
        editPlayer(id, { position: data });  
          // console.log('id: ', socket.id, ' pos:',  data);
          socket.broadcast.emit('moveUser', id, currentPlayer.position);
      }
  });


  socket.on('disconnect', () => {    
    deletePlayer(id);
    socket.broadcast.emit('removeUser', { id });
  });

});


server.listen(port);
console.log('listening on *:' + port);