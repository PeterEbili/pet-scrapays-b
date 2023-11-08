const express = require("express");
const cors = require('cors');
const app = express();
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

app.use(express.static('public'));

app.use(cors());
app.use(express.json());

let dbObj = require('./db');
let theDB = dbObj.theDB;

//----------------------
const sequelize = require('./database');
const User = require('./User');
sequelize.sync().then(() => console.log('db admin is ready'))
//----------------------

app.get('/', (req, res) => {
  res.json({message: "Hello there"});
});

app.get('/notes', (req, res) => {
  //theDB.all("SELECT * FROM notes", (err, results) => {
  theDB.all("SELECT * FROM notes ORDER BY note_id DESC", (err, results) => { 
    if (err) {
      res.send(err.message);
    }
    res.json(results);
  })
  
});

app.post('/notes', (req, res) => {

  let note_id = req.body.note_id; 
  let note_title = req.body.note_title;
  let note_body = req.body.note_body;
  
  theDB.run('INSERT INTO notes (note_id, note_title, note_body) VALUES(?, ?, ?)', [note_id, note_title, note_body], (err => {
    if (err) {
      console.log(err.message);
      res.send(err.message);
    }
    else {
      //theDB.all('SELECT * FROM notes', [], (err, results) => {
      theDB.all("SELECT * FROM notes ORDER BY note_id DESC", [], (err, results) => { //---reverse order
        if (err) {
          console.log(err.message);
          res.send(err.message);            
        }
        else {
          res.json(results);
        }
      })
    }
  }))  
   
});

app.get('/notes/:note_id', (req, res) => {
  const note_id = req.params.note_id;
  let sql = 'SELECT note_title, note_body FROM notes WHERE note_id = ?';
  theDB.run(sql, [note_id], (err) => {
    if (err) {
      res.send(err.message);
    }
    else {
      theDB.all(sql, [note_id], (err, results) => {
        if (err) {
          res.send(err.message);
        }
        else {
          res.json(results);
        }
      })
    }
  })
  
});

app.put('/notes/:note_id', (req, res) => {

  const note_id = req.params.note_id;
  const note_title = req.body.note_title;
  const note_body  = req.body.note_body; 
  
  let sql = 'UPDATE notes SET note_title = ?, note_body = ? WHERE note_id = ?';
  theDB.run(sql, [note_title, note_body, note_id], (err => {
    if (err) {
      res.send(err.message);
    }
    else {
      //theDB.all('SELECT * FROM notes', [], (err, results) => {
      theDB.all("SELECT * FROM notes ORDER BY note_id DESC", [], (err, results) => { //---reverse order
        if(err) {
          res.send(err.message);          
        }
        else {
          res.json(results);
        }
      })
    }
  }))

});

app.delete('/notes/:note_id', (req, res) => {
  const id = req.params.note_id;
  let sql = 'DELETE FROM notes WHERE note_id = ?';
  theDB.run(sql, [id], (err) => {
    if (err) {
      res.send(err.message);
    }
    else {
      //theDB.all('SELECT * FROM notes', [], (err, results) => {  
      theDB.all("SELECT * FROM notes ORDER BY note_id DESC", [], (err, results) => { //---reverse order
        if (err) {
          res.send(err.message);
        }
        else {
          res.json(results);
        }
      })
    }
  })
  
});

//------------------------------------------------//
app.post('/admin', async(req, res) => {
  console.log(req.body, 'testing') 
  let {username, email, password} = req.body;
  username = username.trim();
  email = email.trim();
  password = password.trim();

  if (username =="" || email ==""|| password =="" ) {
      res.json({
          status: "FAILED",
          message: "Empty input field"
      });
  } else if (!/^[a-zA-Z0-9 ]*$/.test(username)) {
      res.json({
          status: "FAILED",
          message: "invalid username entered. No spectial character is required. Uppercase,Lowercase and Numeric only."
      }); 
  }else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
      res.json({
          status: "FAILED",
          message: "invalid email entered"
      }); 
  }
  else if (!/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/.test(password)){
      res.json({
          status: "FAILED",
          message: "password must contain at least one numeric digit, one uppercase, one lowercase and min length of 8 charcters" 
      });   
  }
   // the password test has covered for password.length
  else if (password.length < 8) {
      res.json({
          status: "FAILED",
          message: "Mininum password length is 8 character"
      }); 
  } else {
    // checking if user already exist
    const emailExists = await User.findOne({where: {email:email}}) 
    if (emailExists){
        res.json({
          status: "FAILED",
          message: " User with the provided email alredy exists"
        })
    }

    else {
    //   create new user
          User.create(req.body)
          .then(results =>{
            
            res.json({results,
                      status: "SUCCESS",
                      message: " Signup successful yyyeesss"  
                      }) 
          })
          .catch(err => {
                    
            res.json({
                status: "FAILED",
                message: " An error occured while saving your account"
            })

          })
        }
 
  }

})

app.post('/forgotPassword', async(req, res) => {  
  const {email} = req.body;

  if ( email =="") {
      res.json({
        status: "FAILED",
        message: "Empty input field"
      });
  }else {
      //check if user exist
      const emailExists = await User.findOne({where: {email:email}})

      if (!emailExists){
        res.json({
          status: "FAILED",
          message: " Credentials does not exists"
        })
      } else{
        const user = emailExists.dataValues.username 
        const id = emailExists.dataValues.id 

        const data = {
          user:emailExists.dataValues.username,
          id:emailExists.dataValues.id,
        }
        res.json({
          status: "SUCCESS",
          message: "  email present",
          data: data
        })

      }
  }
 
}) 

app.post('/resetPassword', async( req, res ) => {
  const {password, Id} = req.body 

  if (password =="" ) {
    res.json({
        status: "FAILED",
        message: "Empty input field"
    });
  }
  // validate the password at this time
  else if (!/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/.test(password)){
    res.json({
        status: "FAILED",
        message: "password must contain at least one numeric digit, one uppercase, one lowercase and min length of 8 charcters" 
    });  
  }else{
    const requestedId = req.body.userID;
    const user = await User.findOne({where: {id:requestedId}})
    user.password = req.body.password;
    await user.save();
    res.json({
      status: "SUCCESS",
      message: "Password reset successful proceed to Login",
    })
  
  }
 
});

app.post('/login', async(req, res) => {
  let {email, password} = req.body;
  email = email.trim();
  password = password.trim();

  if ( email ==""|| password =="") {
      res.json({
      status: "FAILED",
      message: "Empty input field "
      });
  }else {
      //check if user exist
      const emailExists = await User.findOne({where: {email:email}})

      //check for database password of the email 
      if (emailExists) {
        //the user input password
        const loginPassword = password
        //the database password
        const dbPassword = emailExists.dataValues.password
        console.log(loginPassword, '---p1')
        console.log(dbPassword, '---p2')

          if (loginPassword == dbPassword ){
            const data = emailExists.dataValues.username
            res.json({data,
              status: "SUCCESS",
              message: "Login successful"
            })
          }else{
            res.json({
              status: "FAILED",
              message: "Invalid Password Credentials"
            })
          }

      }else {
          res.json({
            status: "FAILED",
            message: " Invalid Email Credentials"
          })      
      }

  }
});

// listen for requests 
app.listen(5000, 'localhost', () => console.log('peter new app listering at http://localhost:5000'))
 


