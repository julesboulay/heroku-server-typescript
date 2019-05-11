import getDBConnection from "../database/connection";
import config from "../../config/config";

const connection = getDBConnection(config());

var tables = [
  "Post",
  "ConfirmMarzocco",
  //"User",

  "ReviewHit",
  "EvaluatedPicture",
  "Evaluation",
  "Cafe"
];

tables.map(t => {
  connection.query(`DELETE FROM ${t};`, function(error: any, result: any) {
    if (error) console.log(error.message);
    console.log(result);
  });
});
