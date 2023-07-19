var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');
const { ChatGPT } = require('openai'); // Replace with your ChatGPT library or implementation
// Initialize your ChatGPT instance
const chatGPT = new ChatGPT(); // Replace with your ChatGPT initialization logic

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

app.use(bodyParser.json());


// POST /chat endpoint
app.post('/chat', async (req, res) => {
  const userMessage = req.body.message;

  // Generate response using ChatGPT
  const botMessage = await chatGPT.generateResponse(userMessage);

  res.json({ message: botMessage });
});

// Start the server
const port = 3000; // Replace with your desired port number
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
