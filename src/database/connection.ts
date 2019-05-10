const mysql = require("mysql");

export default function getDatabaseConnection(config: any): any {
  var connection = mysql.createConnection({
    host: config.database.host,
    user: config.database.user,
    port: config.database.port,
    password: config.database.password,
    database: config.database.db
  });
  connection.connect();
  return connection;
}
