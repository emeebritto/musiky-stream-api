const express = require('express');
const radio = require('./src/radios');
const app = express();
//const httpsServer = require('http').Server(app)
//const { Server } = require('socket.io');
//const io = new Server(5588);

const httpsServer = require('http').Server(app);
const io = require('socket.io')(httpsServer);

radio.init(io);

io.on('connection', (socket) => {
  console.log(`id ${socket.id} conectado.`)
  socket.on("connect-media", mediaId => {
    if (radio.isActive(mediaId)) {
      socket.join(mediaId);
      socket.emit("update-channel", radio.syncRadio(mediaId));
      console.log(`${socket.id} conectado na radio ${mediaId}`);      
    }
  })
  socket.on("disconnect-media", () => {
    socket.disconnect();
    console.log(`${socket.id} desconectou`);
  })
})

module.exports = { httpsServer, io, app };