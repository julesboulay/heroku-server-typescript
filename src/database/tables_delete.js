const mysql = require("mysql");

//const config = require("../../config/config_test")["production"];
const config = require("../../config/config")["development"];

var connection = mysql.createConnection({
  host: config.database.host,
  user: config.database.user,
  port: config.database.port,
  password: config.database.password,
  database: config.database.db
});
connection.connect();

var tables = [
  "ImgQueueItem",
  "DwlQueueItem",
  "Post",
  "ReviewHit",
  "EvaluatedPicture",
  "Evaluation",
  "Cafe"
];

tables.map(t => {
  connection.query(`DELETE FROM ${t};`, function(error, result) {
    if (error) console.log(error.message);
    console.log(result);
  });
});
