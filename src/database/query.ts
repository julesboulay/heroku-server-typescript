import getDBConnection from "../database/connection";
import config from "../../config/config";

const connection = getDBConnection(config());

let query1 = `SELECT place_id FROM Cafe`,
  query2 = `SELECT evaluation_id FROM Evaluation`,
  query3 = "SELECT marzocco_likelihood from EvaluatedPicture";

connection.query(query1, function(error: any, result: any) {
  if (error) console.log(error.message);
  console.log(result);
});
