var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
// Question13 support
var session = require('express-session');

// var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');
var walkRoutes = require('./routes/walkRoutes');
var userRoutes = require('./routes/userRoutes');
var db = require('./models/db');

var app = express();

// npm audit fix --force
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

// Q13 session setup
app.use(session({
    secret:'dogwalk-secret-key-part2',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Default is false.
}));

//middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '/public')));

app.use(logger('dev'));
// app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', indexRouter);
// app.use('/users', usersRouter);
app.use('/api/walks', walkRoutes);
app.use('/api/users', userRoutes);

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// basic route protection
app.get('/owner-dashboard.html', function(req, res) {
  if (!req.session.user || req.session.user.role !== 'owner') {
    return res.redirect('/'); // Redirect if not logged in as owner
  }
  res.sendFile(path.join(__dirname, 'public', 'owner-dashboard.html'));
});
app.get('/walker-dashboard.html', function(req, res) {
  if (!req.session.user || req.session.user.role !== 'walker') {
    return res.redirect('/'); // Redirect if not logged in as walker
  }
  res.sendFile(path.join(__dirname, 'public', 'walker-dashboard.html'));
});

// Q17: /api/dogs endpoint from part1
app.get('/api/dogs', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT d.name as dog_name, d.size, u.username as owner_username
      FROM Dogs d
      JOIN Users u ON d.owner_id = u.user_id
    `);
    res.json({ dogs: rows });
  } catch (error) {
    console.error('Error fetching dogs:', error);
    res.status(500).json({ error: 'Failed to fetch dogs' });
  }
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500).json({
    error: 'Something went wrong',
    message: err.message
  });
});





module.exports = app;
