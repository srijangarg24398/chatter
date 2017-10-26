var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

app.io = require('socket.io')();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

users={}
chats=[]

app.io.on('connection',(socket)=>{  
  console.log('a user connected');
  socket.on('login',(username)=>{
  	console.log('User logged in '+socket.id+username)
  	users[socket.id]=username
  	socket.join(username)
  	socket.emit('logged in',{username,chats})
  })
  socket.on('new-message',(message)=>{
  	if (message.charAt(0)==='@'){
  		let sendTo=message.substr(1).split(" ")[0]
  		let finalMessage=users[socket.id]+" : "+message
  		app.io.to(sendTo).emit('recieve-message',finalMessage);
      app.io.to(sendTo).emit('notify',finalMessage);
  	}else{
  		let finalMessage=users[socket.id]+" : "+message
  		chats.push(finalMessage);
  		app.io.emit('recieve-message',finalMessage)
  	}
  })
  socket.on('disconnect',()=>{console.log("user disconnected")});
});

module.exports = app;
