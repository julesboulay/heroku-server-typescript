import getDBConnection from "../database/connection";
import config from "../../config/config";

const connection = getDBConnection(config());

let query1 = `SELECT place_id FROM Cafe`,
  query2 = `SELECT evaluation_id FROM Evaluation`,
  query3 = `
    SELECT C.name, EP.marzocco_likelihood 
    FROM Cafe C, Evaluation E, EvaluatedPicture EP
    WHERE 
      C.place_id LIKE E.place_id AND
      E.evaluation_id = EP.evaluation_id`,
  query4 = `
    SELECT
      C.place_id, 
      C.name, 
      C.lat, 
      C.lng, 
      C.address
    FROM Cafe C, Evaluation E
    WHERE
      C.lat < ${23} AND
      C.lat > ${21} AND
      C.lng < ${115} AND
      C.lng > ${113} AND (
      E.evaluation_id IN (
        SELECT EP.evaluation_id
        FROM Evaluation E, EvaluatedPicture EP
        WHERE
          E.evaluation_id = EP.evaluation_id AND
          EP.marzocco_likelihood > ${0.01}
        GROUP BY EP.evaluation_id
      ) OR
      C.place_id IN (
        SELECT place_id FROM Post))
    GROUP BY C.place_id
    ORDER BY C.place_id DESC;`,
  query5 = `
      SELECT COUNT(EP.photo_reference)
      FROM Evaluation E, EvaluatedPicture EP
      WHERE
            E.evaluation_id = EP.evaluation_id AND
            EP.marzocco_likelihood > ${0.01}
      GROUP BY E.evaluation_id`;

connection.query(query5, function(error: any, result: any) {
  if (error) console.log(error.message);
  else console.log(result);
});
