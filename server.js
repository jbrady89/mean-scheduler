// server.js

// modules =================================================
var express        = require('express');
var app            = express();
var bodyParser     = require('body-parser');
var methodOverride = require('method-override');
var mongoose 	   = require('mongoose');
// configuration ===========================================
    
// config files
var db = require('./config/db');

// set our port
var port = process.env.PORT || 1337; 

// connect to our mongoDB database 
// (uncomment after you enter in your own credentials in config/db.js)
mongoose.connect(process.env.MONGOLAB_URI || db.url);

// get all data/stuff of the body (POST) parameters
// parse application/json 
//app.use(morgan());

app.use(bodyParser.json()); 

// parse application/vnd.api+json as json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); 

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true })); 

// override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
app.use(methodOverride('X-HTTP-Method-Override')); 

// set the static files location /public/img will be /img for users
app.use(express.static(__dirname + '/public')); 

// routes ==================================================
require('./app/routes')(app); // configure our routes

// start app ===============================================
// startup our app at http://localhost:8080
var server = app.listen(port);
var io = require("socket.io").listen(server);  

var connectionCount = 0;

io.on('connection', function(socket){

  connectionCount += 1;
  //console.log("we have a new connection");
  //console.log("users connected: ", connectionCount);

  socket.on('join', function(room){
  	console.log("56: ", room);
    var clients = io.sockets.adapter.rooms[room];
    var numClients = (typeof clients !== 'undefined') ? Object.keys(clients).length : 0;

    if(numClients == 0){

      socket.join(room);
      console.log(io.sockets.adapter.rooms[room]);

    }else if(numClients == 1){

      socket.join(room);
      io.sockets.adapter.rooms[room];
      //socket.emit('ready', room);
      io.sockets.in(room).emit('ready', room);

    }else{
      io.sockets.in(room).emit('full', room);
    }

  });

  socket.on('leave', function(room){
    var clients = io.sockets.adapter.rooms[room];
    var numClients = (typeof clients !== 'undefined') ? Object.keys(clients).length : 0;
    if (numClients !== 0){
      socket.leave(room);
      io.sockets.in(room).emit("leave", room);
    }
  });

  socket.on("message", function(data){
    var room = data.room;
  	io.sockets.in(room).emit("message", data.message);
  });

  socket.on("endCall", function(data){
    console.log("81: " + data);
    var room = data.room;
    io.sockets.in(room).emit("endCall", data);
  });

  socket.on("userIsStreaming", function(){
    socket.emit("userIsStreaming", "I'm streaming");
  });

  socket.on('disconnect', function(data){
  	console.log("user disconnected");
    //console.log(socket);
  	connectionCount -= 1;
    //var room = data.room;
  });
});          

// shoutout to the user                     
console.log('Magic happens on port ' + port);

// expose app           
exports = module.exports = app;