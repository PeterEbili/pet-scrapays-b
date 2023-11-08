let sqlite3 = require('sqlite3').verbose();
const dbname = "Notes.db";

//-----------------------------first model start
let theDB = null;

const prepareDB = (dbname) => {
  return new sqlite3.Database(`./DB/${dbname}`, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE);  
} 

theDB = prepareDB(dbname);
theDB.serialize(() => {
  let sql_notes = `CREATE TABLE IF NOT EXISTS notes (
    note_id INTEGER PRIMARY KEY, 
    note_title TEXT, 
    note_body TEXT) WITHOUT ROWID;`;
      
  theDB.run(sql_notes, [], (err) => {
    if (err) {
      throw "Error creating table notes";         
    }      
  });
 
});

//-----------------------------second model start
let secDB = null;
const prepareDBw = (dbname) => {
  return new sqlite3.Database(`./DB/${dbname}`, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE);  
} 
secDB = prepareDBw(dbname);
secDB.serialize(() => {
  let sql_uses = `CREATE TABLE IF NOT EXISTS adminT ( 
    user_id INTEGER PRIMARY KEY,
    username TEXT,
    email TEXT, 
    password TEXT) WITHOUT ROWID;`;
      
  secDB.run(sql_uses, [], (err) => {
    if (err) {
      throw "Error creating table admin";         
    }      
  });

});
//---------------------------------***----------------

let dbObj = { 
  theDB, secDB
};

module.exports = dbObj;