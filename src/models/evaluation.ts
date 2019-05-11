import { DBResponse, DBError } from "./dbresponse";
import { PlaceDetail } from "../pipeline/placesDetails";
import { PhotoProbability } from "../pipeline/placeProbability";

export default class Evaluation {
  static con: any;

  constructor(connection: any) {
    Evaluation.con = connection;
  }

  getEvaluationsThisMonth(): Promise<DBResponse> {
    const query = `
    SELECT evaluation_id 
    FROM Evaluation
    WHERE  
        MONTH(evaluation_date) = MONTH(CURRENT_DATE()) AND
        YEAR(evaluation_date) = YEAR(CURRENT_DATE());`;

    return new Promise<DBResponse>(function(
      resolve: (res: DBResponse) => any,
      reject: (err: DBError) => any
    ) {
      Evaluation.con.query(query, function(error: any, result: any) {
        if (error) {
          reject({ status: 500, message: error.message });
        } else {
          resolve({ status: 200, result: result });
        }
      });
    });
  }

  saveEvaluation(place_id: string): Promise<DBResponse> {
    const query = `
    INSERT INTO Evaluation (
      place_id, 
      evaluation_date
    ) VALUES (
        '${place_id}', 
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
    let query = `
    INSERT INTO Evaluation (
      place_id, 
      evaluation_date
    ) VALUES `;

    place_details.map(
      p => (query += `("${p.place_id}", ${Evaluation.con.escape(new Date())}),`)
    );
    query = query.substring(0, query.length - 1);

    return new Promise<DBResponse>(function(
      resolve: (res: DBResponse) => any,
      reject: (err: DBError) => any
    ) {
      if (place_details.length == 0)
        reject({ status: 500, message: "Input Evaluation empty" });
      Evaluation.con.query(query, function(error: any, result: any) {
        if (error) {
          reject({ status: 500, message: error.message });
        } else {
          resolve({ status: 200, result: {} });
        }
      });
    });
  }

  static getEvaluation(place_id: string): Promise<DBResponse> {
    const query = `
    SELECT E.evaluation_id 
    FROM Evaluation E
    WHERE E.place_id LIKE '${place_id}';`;

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
    photo_reference: string,
    evaluation_id: number,
    marzocco_likelihood: number
  ): Promise<DBResponse> {
    const query = `
    INSERT INTO EvaluatedPicture (
      photo_reference, 
      evaluation_id,
      marzocco_likelihood
    ) VALUES (
        "${photo_reference}", 
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
    let query = `
    INSERT INTO EvaluatedPicture (
      photo_reference, 
      evaluation_id,
      marzocco_likelihood
    ) VALUES `;

    photo_probs.map(
      p =>
        (query += `("${
          p.photo_reference
        }",(SELECT evaluation_id FROM Evaluation WHERE place_id LIKE "${
          p.place_id
        }"), "${p.marzocco_likelihood}"),`)
    );
    query = query.substring(0, query.length - 1);

    return new Promise<DBResponse>(function(
      resolve: (res: DBResponse) => any,
      reject: (err: DBError) => any
    ) {
      if (photo_probs.length == 0)
        reject({ status: 500, message: "Input EvaluatedPictures empty" });
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
