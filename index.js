console.log('starting the thing now');

const express = require('express');
const app = express();
const PORT = process.env.port || 8080;
const mysql = require('mysql');
const cors = require('cors');
const { encrypt, decrypt } = require('./encrypt');

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
      'SELECT password, iv from users WHERE username = ?',
      [username],
      (err, result) => {
        if (err) {
          res.send(err.message);
        } else {
          if (result[0] === undefined) {
            res.send('wrong username');
          } else if (decrypt(result[0]) === password) {
            res.send({
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
          encryptedPassword: encryptedPassword.password,
        });
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

app.post('/server/posttest', (req, res) => {
  res.send('post requests are working');
})

app.listen(PORT, () => {
  console.log('listening at ' + PORT);
});