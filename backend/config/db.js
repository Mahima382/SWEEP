const mysql = require("mysql2/promise"); //import (promise version)

require("dotenv").config();

let db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

console.log("Database pool created.");
module.exports = db; //export
