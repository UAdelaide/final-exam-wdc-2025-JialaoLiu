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


// async function initializeDatabase() {
//     try {
//         console.log('Question 6 -8');
//         await promisePool.execute(`
//             INSERT INTO Users (username, email, password_hash, role) VALUES
//   ('alice123', 'alice@example.com', 'hashed123', 'owner'),
//   ('bobwalker', 'bob@example.com', 'hashed456', 'walker'),
//   ('carol123', 'carol@example.com', 'hashed789', 'owner'),
//   ('Jarvis', 'Jarvis@example.com', 'hashed123', 'owner'),
//   ('testwalker', 'testwalker@example.com', 'hashed999', 'walker');
//         `);

//         await promisePool.execute(`INSERT INTO Dogs (name, size, owner_id)
// VALUES
//   ('Max', 'medium', (SELECT user_id FROM Users WHERE username = 'alice123')),
//   ('Bella', 'small', (SELECT user_id FROM Users WHERE username = 'carol123')),
//   ('Cookie', 'large', (SELECT user_id FROM Users WHERE username = 'Jarvis')),
//   ('Rookie', 'medium', (SELECT user_id FROM Users WHERE username = 'alice123')),
//   ('Trey', 'small', (SELECT user_id FROM Users WHERE username = 'Jarvis'));
//             `);

//         await promisePool.execute(`INSERT INTO WalkRequests (dog_id, requested_time, duration_minutes, location, status)
// VALUES
//   ((SELECT dog_id FROM Dogs WHERE name = 'Max'), '2025-06-10 08:00:00', 30, 'Parklands', 'open'),
//   ((SELECT dog_id FROM Dogs WHERE name = 'Bella'), '2025-06-10 09:30:00', 45, 'Beachside Ave', 'accepted'),
//   ((SELECT dog_id FROM Dogs WHERE name = 'Cookie'), '2025-06-21 10:00:00', 60, 'Costco', 'open'),
//   ((SELECT dog_id FROM Dogs WHERE name = 'Rookie'), '2025-06-21 11:30:00', 30, 'Melbourne St', 'open'),
//   ((SELECT dog_id FROM Dogs WHERE name = 'Trey'), '2025-06-21 17:00:00', 90, 'North Adelaide', 'open');
//         `);
//             console.log('Inserted');
//     }
//     catch (error) {
//         console.error('Failed:', error.message);
//     }
// }

//question 6 /api/dogs
app.get('/api/dogs', async (req, res) => {
    try {
        const query = `
        SELECT d.name as dog_name, d.size, u.username as owner_username
        FROM Dogs d
        JOIN Users u ON d.owner_id = u.user_id
        ORDER BY d.name;
    `;
        const [results] = await promisePool.query(query);
        res.json(results);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({error: 'Fetching dogs failed'});
    }
});

//question 7 /api/walkrequests
app.get('/api/walkrequests/open', async (req, res) => {
    try {
        const query = `
            SELECT
                wr.request_id,
                d.name as dog_name,
                wr.requested_time,
                wr.duration_minutes,
                wr.location,
                u.username as owner_username
            FROM WalkRequests wr
            JOIN Dogs d ON wr.dog_id = d.dog_id
            JOIN Users u ON d.owner_id = u.user_id
            WHERE wr.status = 'open'
            ORDER BY wr.requested_time
    `;
        const [results] = await promisePool.query(query);
        res.json(results);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({error: 'Fetching walk requests failed'});
    }
});

//question 8 /api/walkers/summary
app.get('/api/walkers/summary', async (req, res) => {
    try {
        const query = `
            SELECT
                u.username,
                COUNT(DISTINCT d.dog_id) AS total_dogs,
                AVG(r.rating) AS average_rating,
                COUNT(CASE when wr.status = 'completed' then 1 end) AS completed_walks
            FROM Users u
            LEFT JOIN WalkRequests wr ON u.user_id = wr.walker_id
            LEFT JOIN WalkRatings r ON wr.request_id = r.request_id
            WHERE u.role = 'walker'
            GROUP BY u.user_id, u.username
            ORDER BY u.username;
        `;
        const [results] = await promisePool.query(query);
        res.json(results);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({error: 'Fetching walker summary failed'});
    }