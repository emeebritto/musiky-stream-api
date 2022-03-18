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
  socket.on("connect-radio", radioId => {
  	socket.join(radioId);
  	socket.emit("update-channel", radio.syncRadio(radioId));
  	console.log(`${socket.id} conectado na radio ${radioId}`);
  })
  socket.on("disconnect-radio", () => {
    socket.disconnect();
    console.log(`${socket.id} desconectou`);
  })
})

module.exports = { httpsServer, io, app };