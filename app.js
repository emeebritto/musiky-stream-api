const express = require('express');
const RadioCore = require('./src/radio/core');
const app = express();
const httpsServer = require('http').Server(app);
const io = require('socket.io')(httpsServer);
const radio = new RadioCore(io);
radio.start();

module.exports = { httpsServer, io, app };
