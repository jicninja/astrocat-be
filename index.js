  const port = process.env.PORT || 3000;
  const io = require('socket.io')('', {
    cors: {
      origin: '*'
    }    
  });

  io.use((socket, next) => {
      console.log('debug--->', socket);
      if (socket.handshake.query.token === "UNITY") {
          next();
      } else {
          next(new Error("Authentication error"));
      }
  });

  io.on('connection', socket => {
      console.log('debug connected--->', socket);
      socket.emit('newUser', { PlayerId: socket.id });
      /*
    socket.on('hi', (data) => {
      socket.emit('hi', {date: new Date().getTime()});
    });

    socket.on('class', (data, data2) => {
      socket.emit('class', {date: new Date().getTime(), data: data});
    });
    */
  });

  io.listen(port);
  console.log('listening on *:' + port);