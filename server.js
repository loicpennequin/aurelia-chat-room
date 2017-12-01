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

io.on('connection', function(socket){
  socket.on('user joined chatroom', function(user){
    users.push({
      id : socket.id,
      username : user
    })
    console.log(user + ' joined the chatroom');
    socket.emit('connection succesful', users)
    socket.broadcast.emit('user joined', {message: user + " joined the chatroom !", users: users})
  });

  socket.on('disconnect', ()=>{
    let index = users.findIndex((user)=>user.id === socket.id);
    if (index !== -1){
      let user = users[index];
      console.log(user.username + ' left the chatroom');
      users.splice(index, 1);
      socket.broadcast.emit('user left', {message: user.username + " left the chatroom !", users: users})
    }
  })

  socket.on('new post', (post)=>{
    let user = users.find((u)=> u.id === socket.id)
    let msg = user.username + " : " + post
    io.sockets.emit('new post', msg)
  })

});

http.listen(process.env.PORT || 8080, ()=>{
  console.log('=============================================================================');
  console.log('    Serveur initialisé sur le port 8080 ...');
  console.log('=============================================================================');
});
