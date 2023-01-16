const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const express = require('express');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

const dbFile = 'accounts.db';
const saltRounds = 10;

const defautUser = 'dudu'
const defaultPass = '12345'

function createDatabase() {
  // Verificar se o arquivo do banco de dados existe
  if (!fs.existsSync(dbFile)) {
    // Criar o banco de dados e a tabela
    let db = new sqlite3.Database(dbFile, (err) => {
      if (err) {
        console.error(err.message);
      }
      console.log('Connected to the accounts database.');
    });

    db.run(`CREATE TABLE IF NOT EXISTS accounts (id INTEGER PRIMARY KEY, name TEXT, password TEXT)`, (err) => {
      if (err) {
        console.error(err.message);
      }
      console.log('Table created successfully');
      addUser(defautUser,defaultPass);
    });
    db.close();
  }
}

function addUser(name, password) {
  bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
      console.error(err.message);
    }
    // Connect to the database
    let db = new sqlite3.Database(dbFile, (err) => {
      if (err) {
        console.error(err.message);
      }
    });
    // Insert the user and hashed password into the table
    db.run(`INSERT INTO accounts (name, password) VALUES (?, ?)`, [name, hash], (err) => {
      if (err) {
        console.error(err.message);
      }
      console.log('User added successfully');
    });
    db.close();
  });
}

function checkUser(name, password, res) {
  // Connect to the database
  let db = new sqlite3.Database(dbFile, (err) => {
    if (err) {
      console.error(err.message);
    }
  });
  // Get the hashed password for the user
  db.get(`SELECT password FROM accounts WHERE name = ?`, [name], (err, row) => {
    if (err) {
      console.error(err.message);
    }
    if (!row) {
      console.log('Invalid username or password');
    } else {
      bcrypt.compare(password, row.password, (err, result) => {
        if (err) {
          console.error(err.message);
        }
        if (result) {
          res.redirect('/logado.html');
        } else {
          res.redirect('/login.html');
        }
      });
    }
  });
  db.close();
}


createDatabase();




app.get('/', (req, res) => {
  res.redirect('/login.html');
});


app.post('/login', (req, res) => {
  const name = req.body.username;
  const password = req.body.password;
  checkUser(name, password, res);
});


app.listen(3000, () => {
    console.log('Server started on port 3000');
});
