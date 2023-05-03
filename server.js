const express = require('express')
const app = express()
// const cors = require('cors')
// app.use(cors())
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
  debug: true
});
const { v4: uuidV4 } = require('uuid') //import uuid

app.use('/peerjs', peerServer);

app.set('view engine', 'ejs') //view engine is ejs
app.use(express.static('public'))

app.get('/', (req, res) => {
  res.redirect(`/${uuidV4()}`)
})

app.get('/:room', (req, res) => {
  res.render('room', { userroomID: req.params.room })
}) //passing userroomID

io.on('connection', socket => {
  socket.on('join-room', (userroomID, userId) => {
    socket.join(userroomID)
    socket.to(userroomID).broadcast.emit('user-connected', userId);
    //user connected
    socket.on('message', (message) => {
      //send message to the same room
      io.to(userroomID).emit('createMessage', message)
  }); 

    socket.on('disconnect', () => {
      socket.to(userroomID).broadcast.emit('user-disconnected', userId)
    })
  })
})

server.listen(process.env.PORT||3030)
