const express = require('express');
const app = express();
//const httpsServer = require('http').Server(app)
//const { Server } = require('socket.io');
//const io = new Server(5588);

const httpsServer = require('http').Server(app);
const io = require('socket.io')(httpsServer);

io.on('connection', (socket) => {
  console.log(`id ${socket.id} conectado.`)
})

module.exports = { httpsServer, io, app };