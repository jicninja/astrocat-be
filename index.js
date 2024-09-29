const express = require('express');
const { createServer } = require('http');
const { addPlayer, getOtherPlayers, getPlayer, editPlayer, deletePlayer } = require('./modules/playerCache');
const { getRandom } = require('./utils/random');
const path = require('path');

const app = express();
const server = createServer(app);

const port = process.env.PORT || 3000;

/* STATIC SERVER - Landing Page */
app.use(express.static('public'));
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/public/index.html'));
});

/* RealTime Server */
const io = require('socket.io')(server, {
  cors: {
    origin: '*'
  }
});

/* Authentication 
io.use((socket, next) => {
  if (socket.handshake.query.token === 'UNREAL') {
    next();
  } else {
    next(new Error('Authentication error'));
  }
});
*/

/* On Connect */
io.on('connection', socket => {
  const { id } = socket;

  const initUserData = {
    pos: {
      x: getRandom(300),
      y: getRandom(300),
      z: 0.0,
    },
    rot: {
      pitch: 0.0,
      yaw: 0.0,
      roll: 0.0,
    },
    vel: {
      x: 0.0,
      y: 0.0,
      z: 0.0,
    },
  };

  addPlayer(id, initUserData);
  socket.emit('userStart', initUserData);

  console.log('new user ---->', id, initUserData);

  const users = getOtherPlayers(id);

  if (users.length) {
    //console.log('existing useeeers', id, { users });
    socket.emit('existingUsers', { users });
  }


  /*  Broadcast new user */
  socket.broadcast.emit('newUser', { id, ...initUserData });
  socket.on('moveUser', data => {
    const currentPlayer = getPlayer(id);

    if (currentPlayer && currentPlayer != data) {
      editPlayer(id, data);
      socket.broadcast.emit('moveUser', data);
    }
  });


  socket.on('disconnect', () => {

    console.log('debug exit,', getPlayer(id), id);
    deletePlayer(id);
    socket.broadcast.emit('removeUser', id);
  });

});


server.listen(port);
console.log('listening on *:' + port);
