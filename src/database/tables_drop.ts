import getDBConnection from "../database/connection";
import config from "../../config/config";

const connection = getDBConnection(config());

var tables = [
  { name: "Post", sql: `DROP TABLE Post;` },
  { name: "ConfirmMarzocco", sql: `DROP TABLE ConfirmMarzocco;` },
  { name: "User", sql: `DROP TABLE User;` },

  { name: "ReviewHit", sql: `DROP TABLE ReviewHit;` },
  { name: "EvaluatedPicture", sql: `DROP TABLE EvaluatedPicture;` },
  { name: "Evaluation", sql: `DROP TABLE Evaluation;` },
  { name: "Cafe", sql: `DROP TABLE Cafe;` }
];

tables.map(table => {
  connection.query(table.sql, function(error: any, result: any) {
    if (error) throw error;
    console.log("Table " + table.name + " Dropped");
  });
});
