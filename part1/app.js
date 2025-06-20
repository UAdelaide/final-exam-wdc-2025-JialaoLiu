// mySQL connection setup
const mySQL = require('mysql2');

const pool = mySQL.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'DogWalkService',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const promisePool = pool.promise();
// For routes
module.exports.promisePool = promisePool;


var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

module.exports = app;


async function initializeDatabase() {
    try {
        console.log('Question 6 -8');
        await promisePool.execute(
            
        )
    }