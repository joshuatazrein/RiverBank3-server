console.log('starting the thing now');

const express = require('express');
const app = express();
const PORT = process.env.port || 8080;
const mysql = require('mysql');
const cors = require('cors');
const { encrypt, decrypt } = require('./encrypt');
const resetData = require('./resetData');
const database = require('./database');

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  user: 'joshgncd_joshua',
  host: 'server204.web-hosting.com',
  password: 'Sn1m]x3RpMrU',
  database: 'joshgncd_riverbank',
});

// for local testing
// const db = mysql.createConnection({
//   user: 'root',
//   host: 'localhost',
//   password: '',
//   database: 'RiverBank',
// });

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
      'SELECT password, iv from users WHERE username = ?',
      [username],
      (err, result) => {
        if (err) {
          res.send(err.message);
        } else {
          if (result[0] === undefined) {
            res.send('wrong username');
          } else if (decrypt(result[0]) === password) {
            // read file from JSON
            const encryptedPassword = result[0].password;
            const data = database.readFile(
              username, encryptedPassword
            );
            res.send({
              settings: data.settings,
              tasks: data.tasks,
              encryptedPassword: encryptedPassword,
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
    'INSERT INTO users (username, password, iv) VALUES (?, ?, ?)',
    [
      username,
      encryptedPassword.password,
      encryptedPassword.iv
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

// set new task data
app.post('/server/settaskdata', (req, res) => {
  const { id, value, username, encryptedPassword } = req.body;
  const valueString = JSON.stringify(value);
  try {
    database.updateTaskDataFile(username, encryptedPassword, id, value);
    res.send('success');
  } catch (err) {
    res.send(err.message);
  }
});

// remove task data
app.post('/server/removetaskdata', (req, res) => {
  const { id, username, encryptedPassword } = req.body;
  try {
    database.removeTaskDataFile(username, encryptedPassword, id, value);
    res.send('success');
  } catch (err) {
    res.send(err.message);
  }
});

// upload settings
app.post('/server/uploadsettings', (req, res) => {
  const { username, encryptedPassword, data } = req.body;
  try {
    database.uploadSettingsFile(username, encryptedPassword, data);
    res.send('success');
  } catch (err) {
    res.send(err.message)
  }
});

// upload tasks
app.post('/server/uploadtasks', (req, res) => {
  const { username, encryptedPassword, data } = req.body;
  try {
    database.uploadTasksFile(username, encryptedPassword, data);
    res.send('success');
  } catch (err) {
    res.send(err.message)
  }
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

app.post('/server/posttest', (req, res) => {
  res.send(['post requests are working', req.body]);
})

app.listen(PORT, () => {
  console.log('listening at ' + PORT);
});