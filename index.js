const express = require('express');
const app = express();
const PORT = 3001;
const mysql = require('mysql');
const cors = require('cors');
const {encrypt, decrypt} = require('./encrypt');
const resetData = require('./resetData');

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  user: 'root',
  host: 'localhost',
  password: '',
  database: 'RiverBank',
});

db.connect(function(err) {
  if (err) {
    return console.error('error: ' + err.message);
  }
  console.log('Connected to the MySQL server.');
});

// login old user
app.post('/login', (req, res) => {
  const {username, password} = req.body;
  console.log('logging in');
  db.query(
    'SELECT password, iv, settings, tasks from users WHERE username = ?',
    [username],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        if (result[0] === undefined) {
          res.send('wrong username');
        } else if (decrypt(result[0]) === password) {
          res.send({
            settings: JSON.parse(result[0].settings),
            tasks: JSON.parse(result[0].tasks),
            encryptedPassword: result[0].password,
          });
        } else {
          res.send('wrong password');
        }
      }
    }
  );
})

// create new user
app.post('/createuser', (req, res) => {
  const {username, password} = req.body;
  const encryptedPassword = encrypt(password);

  db.query(
    'INSERT INTO users (username, password, iv, settings, tasks) VALUES (?, ?, ?, ?, ?)',
    [
      username, 
      encryptedPassword.password, 
      encryptedPassword.iv, 
      '{}', // data will be initialized on load
      '{}',
    ],
    (err, result) => {
      if (err) {
        console.log(err);
        res.send('duplicate username');
      } else {
        res.send({
          settings: resetData.resetData.settings, 
          tasks: resetData.resetData.tasks,
          encryptedPassword: encryptedPassword,
        });
      }
    }
  )
});

// upload settings
app.post('/uploadsettings', (req, res) => {
  const {username, encryptedPassword, data} = req.body;
  db.query(
    'UPDATE users \
    SET settings = ? \
    WHERE username = ? AND password = ?',
    [JSON.stringify(data), username, encryptedPassword],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send('Success');
      }
    }
  )
});

// upload tasks
app.post('/uploadtasks', (req, res) => {
  const {username, encryptedPassword, data} = req.body;
  db.query(
    'UPDATE users \
    SET tasks = ? \
    WHERE username = ? AND password = ?',
    [JSON.stringify(data), username, encryptedPassword],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send('Success');
      }
    }
  )
});

app.listen(PORT, () => {
  console.log('listening at ' + PORT);
});