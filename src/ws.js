const { io } = require('../app');

io.on('connection', (socket) => {
  console.log(`id ${user._id} conectado.`)
})