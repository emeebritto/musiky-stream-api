const express = require('express');
// const RadioCore = require('./src/radio/core');
const app = express();
const httpsServer = require('http').Server(app);
const io = require('socket.io')(httpsServer);

// try {
// 	const radio = new RadioCore(io);
// 	radio.start();
// } catch(err) {
// 	console.error(err);
// }

module.exports = { httpsServer, io, app };
