'use strict';

require('dotenv').config({
    path : './.env'
});

/*  =============================================================================
    Express & socket.io
    ============================================================================= */

const express = require('express'),
      app = express(),
      http = require('http').Server(app),
      io = require('socket.io')(http),
      session = require('express-session'),
      sessionParams = session({secret: 's3cr3t', resave : false, saveUninitialized : true}),
      ios = require('socket.io-express-session');

/*  =============================================================================
    Dependencies
    ============================================================================= */

const bodyParser = require('body-parser'),
      cookieParser = require('cookie-parser');


/*  =============================================================================
    App Config
    ============================================================================= */

app.disable('x-powered-by');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static('.'));
app.use(sessionParams);
app.use(express.static('public'));
io.use(ios(sessionParams));


/*  =============================================================================
Socket.io Config
============================================================================= */
let users = [];
let socketsArr = [];

io.on('connection', function(socket){
  socket.on('user joined chatroom', function(user){
    let isConnected = users.findIndex(user=>user.sessionID===socket.handshake.sessionID);
    if (isConnected !== -1){
      let user = users[isConnected];
      console.log(user.username + ' left the chatroom');
      socket.broadcast.emit('user left', {message: {post: user.username + " has left the chatroom !"}, users: users});
    }
    users.push({
      id : socket.id,
      username : user,
      sessionID : socket.handshake.sessionID
    })
    console.log(user + ' joined the chatroom');
    socket.emit('connection succesful', users)
    socket.broadcast.emit('user joined', {message: {post: user + " joined the chatroom !"}, users: users})
  });

  socket.on('disconnect', ()=>{
    let index = users.findIndex(user=>user.id === socket.id);
    if (index !== -1){
      let user = users[index];
      console.log(user.username + ' left the chatroom');
      users.splice(index, 1);
      socket.broadcast.emit('user left', {message: {post: user.username + " left the chatroom !"}, users: users})
    }
  })

  socket.on('new post', (post)=>{
    let user = users.find((u)=> u.id === socket.id)
    let msg =  {
        user : user.username,
        post : post
    }
    io.sockets.emit('new post', msg)
  })

  socket.on('new pm', (data)=>{
    let target = users.find(u=>u.sessionID === data.target.sessionID).id;
    let room = socket.id + target;
    socket.join(room);
    io.of("/").connected[target].join(room);

    socket.to(room).emit('new pm', {user: users.find(u=>u.id===socket.id), post: data.post});
  })
});

http.listen(process.env.PORT || 8080, ()=>{
  console.log('=============================================================================');
  console.log('    Serveur initialisé sur le port 8080 ...');
  console.log('=============================================================================');
});
