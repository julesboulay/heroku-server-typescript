import { DBResponse, DBError } from "./dbresponse";
import { PlaceDetail } from "../pipeline/placesDetails";
import { PhotoProbability } from "../pipeline/placeProbability";

export default class Evaluation {
  static con: any;

  constructor(connection: any) {
    Evaluation.con = connection;
  }

  getEvaluationsThisMonth(MAX_PLACES_API_CALLS: number): Promise<DBResponse> {
    const query = `
    SELECT evaluation_id 
    FROM Evaluation
    WHERE  
        MONTH(date) = MONTH(CURRENT_DATE()) AND
        YEAR(date) = YEAR(CURRENT_DATE());`;

    return new Promise<DBResponse>(function(
      resolve: (res: DBResponse) => any,
      reject: (err: DBError) => any
    ) {
      Evaluation.con.query(query, function(error: any, result: any) {
        if (error) {
          reject({ status: 500, message: error.message });
        } else {
          let evals = result.length;
          let num_of_api_calls_this_month = evals + evals + 10 * evals;
          if (num_of_api_calls_this_month > MAX_PLACES_API_CALLS) {
            reject({ status: 429, message: "Number of API calls exceeded." });
          } else {
            resolve({ status: 200, result: {} });
          }
        }
      });
    });
  }

  saveEvaluation(google_place_id: string): Promise<DBResponse> {
    const query = `
    INSERT INTO Evaluation (
      google_place_id, 
      date
    ) VALUES (
        '${google_place_id}', 
        ${Evaluation.con.escape(new Date())}
    );`;

    return new Promise<DBResponse>(function(
      resolve: (res: DBResponse) => any,
      reject: (err: DBError) => any
    ) {
      Evaluation.con.query(query, function(error: any, result: any) {
        if (error) {
          reject({ status: 500, message: error.message });
        } else {
          resolve({ status: 200, result: {} });
        }
      });
    });
  }

  saveEvaluations(place_details: PlaceDetail[]): Promise<DBResponse> {
    const query = `
    INSERT INTO Evaluation (
      google_place_id, 
      date
    ) VALUES ?`;

    let insert: any = place_details.map(p => [
      p.place_id,
      Evaluation.con.escape(new Date())
    ]);
    return new Promise<DBResponse>(function(
      resolve: (res: DBResponse) => any,
      reject: (err: DBError) => any
    ) {
      Evaluation.con.query(query, [insert], function(error: any, result: any) {
        if (error) {
          reject({ status: 500, message: error.message });
        } else {
          resolve({ status: 200, result: {} });
        }
      });
    });
  }

  static getEvaluation(google_place_id: string): Promise<DBResponse> {
    const query = `
    SELECT E.evaluation_id 
    FROM Evaluation E
    WHERE E.google_place_id LIKE '${google_place_id}';`;

    return new Promise<DBResponse>(function(
      resolve: (res: DBResponse) => any,
      reject: (err: DBError) => any
    ) {
      Evaluation.con.query(query, function(error: any, result: any) {
        if (error) {
          reject({ status: 500, message: error.message });
        } else {
          resolve({ status: 200, result: result[0] });
        }
      });
    });
  }

  saveReviewHit(
    evaluation_id: number,
    hit_word: string,
    review: string
  ): Promise<DBResponse> {
    const query = `
    INSERT INTO ReviewHit (
      evaluation_id,
      hit_word,
      review
    ) VALUES ( 
        ${evaluation_id},
        '${hit_word}',
        "${review}"
    );`;

    return new Promise<DBResponse>(function(
      resolve: (res: DBResponse) => any,
      reject: (err: DBError) => any
    ) {
      Evaluation.con.query(query, function(error: any, result: any) {
        if (error) {
          reject({ status: 500, message: error.message });
        } else {
          resolve({ status: 200, result: {} });
        }
      });
    });
  }

  saveEvaluatedPicture(
    photo_id: string,
    evaluation_id: number,
    marzocco_likelihood: number
  ): Promise<DBResponse> {
    const query = `
    INSERT INTO EvaluatedPicture (
      google_picture_id, 
      evaluation_id,
      marzocco_likelihood
    ) VALUES (
        "${photo_id}", 
        '${evaluation_id}',
        ${marzocco_likelihood}
    );`;

    return new Promise<DBResponse>(function(
      resolve: (res: DBResponse) => any,
      reject: (err: DBError) => any
    ) {
      Evaluation.con.query(query, function(error: any, result: any) {
        if (error) {
          reject({ status: 500, message: error.message });
        } else {
          resolve({ status: 200, result: {} });
        }
      });
    });
  }

  saveEvaluatedPictures(photo_probs: PhotoProbability[]): Promise<DBResponse> {
    const query = `
    INSERT INTO EvaluatedPicture (
      google_picture_id, 
      evaluation_id,
      marzocco_likelihood
    ) VALUES ?`;

    let insert = photo_probs.map(p => [
      p.photo_reference,
      `(SELECT evaluation_id FROM Evaluation WHERE google_place_id LIKE ${
        p.place_id
      })`,
      p.probability
    ]);
    return new Promise<DBResponse>(function(
      resolve: (res: DBResponse) => any,
      reject: (err: DBError) => any
    ) {
      Evaluation.con.query(query, function(error: any, result: any) {
        if (error) {
          reject({ status: 500, message: error.message });
        } else {
          resolve({ status: 200, result: {} });
        }
      });
    });
  }
}
