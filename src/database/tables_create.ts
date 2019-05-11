import getDBConnection from "../database/connection";
import config from "../../config/config";

const connection = getDBConnection(config());

const tables = [
  {
    name: "Cafe",
    sql: `
    CREATE TABLE Cafe (
      place_id VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      lat DOUBLE NOT NULL,
      lng DOUBLE NOT NULL,
      address TEXT NOT NULL,
  
      PRIMARY KEY(place_id)
  ) ENGINE = INNODB;`
  },
  {
    name: "Evaluation",
    sql: `
    CREATE TABLE Evaluation (
      evaluation_id INT(12) NOT NULL AUTO_INCREMENT,
      place_id VARCHAR(255) NOT NULL,
      evaluation_date DATETIME NOT NULL,
  
      PRIMARY KEY(evaluation_id),
      FOREIGN KEY(place_id) REFERENCES Cafe(place_id)
  ) ENGINE = INNODB AUTO_INCREMENT=1;`
  },
  {
    name: "EvaluatedPicture",
    sql: `
    CREATE TABLE EvaluatedPicture (
      photo_reference VARCHAR(255) NOT NULL,
      evaluation_id INT(12) NOT NULL,
      marzocco_likelihood DOUBLE NOT NULL,
  
      PRIMARY KEY(photo_reference),
      FOREIGN KEY(evaluation_id) REFERENCES Evaluation(evaluation_id)
  ) ENGINE = INNODB;`
  },
  {
    name: "ReviewHit",
    sql: `
    CREATE TABLE ReviewHit (
      reviewhit_id INT(12) NOT NULL AUTO_INCREMENT,
      evaluation_id INT(12) NOT NULL,
      hit_word VARCHAR(255) NOT NULL,
      review TINYTEXT NOT NULL,
  
      PRIMARY KEY(reviewhit_id),
      FOREIGN KEY(evaluation_id) REFERENCES Evaluation(evaluation_id)
    ) ENGINE = INNODB AUTO_INCREMENT=1;`
  },
  {
    name: "User",
    sql: `
    CREATE TABLE User (
      email VARCHAR(255) NOT NULL,
      username VARCHAR(20) NOT NULL,
      password VARCHAR(100) NOT NULL,
      sign_up_date DATETIME NOT NULL,
  
      PRIMARY KEY(email)
  ) ENGINE = INNODB AUTO_INCREMENT=1;`
  },
  {
    name: "ConfirmMarzocco",
    sql: `
    CREATE TABLE ConfirmMarzocco(
      place_id VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      confirm_date DATETIME NOT NULL,
  
      PRIMARY KEY(place_id, email),
      FOREIGN KEY(place_id) REFERENCES Cafe (place_id),
      FOREIGN KEY(email) REFERENCES User (email)
  ) ENGINE = INNODB AUTO_INCREMENT=1;`
  },
  {
    name: "Post",
    sql: `
    CREATE TABLE Post (
      place_id VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      post_date DATETIME NOT NULL,
  
      PRIMARY KEY(place_id),
      FOREIGN KEY(place_id) REFERENCES Cafe(place_id),
      FOREIGN KEY(email) REFERENCES User(email)
  ) ENGINE = INNODB AUTO_INCREMENT=1;`
  }
];

tables.map(table => {
  connection.query(table.sql, function(error: any, result: any) {
    if (error) throw error;
    console.log("Table " + table.name + " Created");
  });
});
