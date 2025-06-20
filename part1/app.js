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
        await promisePool.execute(`
            INSERT INTO Users (username, email, password_hash, role) VALUES
  ('alice123', 'alice@example.com', 'hashed123', 'owner'),
  ('bobwalker', 'bob@example.com', 'hashed456', 'walker'),
  ('carol123', 'carol@example.com', 'hashed789', 'owner'),
  ('Jarvis', 'Jarvis@example.com', 'hashed123', 'owner'),
  ('testwalker', 'testwalker@example.com', 'hashed999', 'walker');
        `);

        await promisePool.execute(`INSERT INTO Dogs (name, size, owner_id)
VALUES
  ('Max', 'medium', (SELECT user_id FROM Users WHERE username = 'alice123')),
  ('Bella', 'small', (SELECT user_id FROM Users WHERE username = 'carol123')),
  ('Cookie', 'large', (SELECT user_id FROM Users WHERE username = 'Jarvis')),
  ('Rookie', 'medium', (SELECT user_id FROM Users WHERE username = 'alice123')),
  ('Trey', 'small', (SELECT user_id FROM Users WHERE username = 'Jarvis'));
            `);

        await promisePool.execute(`INSERT INTO WalkRequests (dog_id, requested_time, duration_minutes, location, status)
VALUES
  ((SELECT dog_id FROM Dogs WHERE name = 'Max'), '2025-06-10 08:00:00', 30, 'Parklands', 'open'),
  ((SELECT dog_id FROM Dogs WHERE name = 'Bella'), '2025-06-10 09:30:00', 45, 'Beachside Ave', 'accepted'),
  ((SELECT dog_id FROM Dogs WHERE name = 'Cookie'), '2025-06-21 10:00:00', 60, 'Costco', 'open'),
  ((SELECT dog_id FROM Dogs WHERE name = 'Rookie'), '2025-06-21 11:30:00', 30, 'Melbourne St', 'open'),
  ((SELECT dog_id FROM Dogs WHERE name = 'Trey'), '2025-06-21 17:00:00', 90, 'North Adelaide', 'open');
        `);
            console.log('Inserted');
    }
    catch (error) {
        console.error('Failed:', error.message);
    }
}

app.get('/api/dogs', async (req, res) => {
    try {
        const query = ``
    }