
const express = require('express');
const app = express();
const PORT = process.env.port || 8080;
const mysql = require('mysql');
const cors = require('cors');
const { encrypt, decrypt } = require('./encrypt');
const fs = require('fs');
const resetData = require('./resetData');

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  user: 'joshgncd_joshua',
  host: 'server204.web-hosting.com',
  password: 'Sn1m]x3RpMrU',
  database: 'joshgncd_riverbank',
});

var errors = ''; // for logging on the Get request

db.connect(function (err) {
  if (err) {
    errors = err.message;
    return console.error('error: ' + err.message);
  } else {
    errors = 'Connected to the MySQL server.';
  }
});

// login old user
app.post('/server/login', (req, res) => {
  try {
    const { username, password } = req.body;
    db.query(
      'SELECT password, iv, settings, tasks from users WHERE username = ?',
      [username],
      (err, result) => {
        if (err) {
          res.send(err.message);
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
  } catch (err) {
    res.send(err.message);
  }
});

// create new user
app.post('/server/createuser', (req, res) => {
  const { username, password } = req.body;
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
        res.send('duplicate username');
      } else {
        res.send({
          settings: resetData.resetData.settings,
          tasks: resetData.resetData.tasks,
          encryptedPassword: encryptedPassword.password,
        });
      }
    }
  )
});

// upload settings
app.post('/server/uploadsettings', (req, res) => {
  const { username, encryptedPassword, data } = req.body;
  db.query(
    'UPDATE users \
    SET settings = ? \
    WHERE username = ? AND password = ?',
    [JSON.stringify(data), username, encryptedPassword],
    (err, result) => {
      if (err) {
        res.send(err.message);
      } else {
        res.send('Success');
      }
    }
  )
});

// upload tasks
app.post('/server/uploadtasks', (req, res) => {
  const { username, encryptedPassword, data } = req.body;
  db.query(
    'UPDATE users \
    SET tasks = ? \
    WHERE username = ? AND password = ?',
    [JSON.stringify(data), username, encryptedPassword],
    (err, result) => {
      if (err) {
        res.send(err.message);
      } else {
        res.send('Success');
      }
    }
  )
});

app.get('/server/', (req, res) => {
  db.query(
    'SELECT * from users',
    (err, result) => {
      if (err) {
        res.send(err.message);
      } else {
        res.send(result);
      }
    }
  )
});

app.get('/server/fstest', (req, res) => {
  fs.readdir(__dirname, (err, files) => {
    if (err) {
      res.send(err.message);
    } else {
      res.send(files);
    }
  })
});

app.post('/server/posttest', (req, res) => {
  res.send('post requests are working');
});

app.listen(PORT, () => {
  console.log('listening at ' + PORT);
});