import { DBResponse, DBError } from "./dbresponse";
import { PlaceDetail } from "../pipeline/placesDetails";

export default class Cafe {
  static con: any;

  constructor(connection: any) {
    Cafe.con = connection;
  }

  getCafes(
    lat: number,
    lng: number,
    diff: number,
    marzocco_likelihood = 0.01
  ): Promise<DBResponse> {
    if (diff == undefined || isNaN(diff)) diff = 5;
    const n: number = Number(lat) + Number(diff);
    const s: number = Number(lat) - Number(diff);
    const e: number = Number(lng) + Number(diff) * 2;
    const w: number = Number(lng) - Number(diff) * 2;

    const DEC = 10000;
    const round: (num: number) => number = num => Math.round(num * DEC) / DEC;
    const query = `
      SELECT
        C.place_id, 
        C.name, 
        C.lat, 
        C.lng, 
        C.address
      FROM Cafe C, Evaluation E
      WHERE
        C.lat < ${round(n)} AND
        C.lat > ${round(s)} AND
        C.lng < ${round(e)} AND
        C.lng > ${round(w)} AND (
        E.evaluation_id IN (
          SELECT EP.evaluation_id
          FROM Evaluation E, EvaluatedPicture EP
          WHERE
            E.evaluation_id = EP.evaluation_id AND
            EP.marzocco_likelihood > ${marzocco_likelihood}
          GROUP BY EP.evaluation_id
        ) OR
        C.place_id IN (
          SELECT place_id FROM Post))
      GROUP BY C.place_id
      ORDER BY C.place_id DESC;`;

    return new Promise<DBResponse>(function(
      resolve: (res: DBResponse) => any,
      reject: (err: DBError) => any
    ) {
      Cafe.con.query(query, function(error: any, result: any) {
        if (error) {
          reject({ status: 500, message: error.message });
        } else {
          resolve({ status: 200, result: result });
        }
      });
    });
  }

  getCafe(place_id: string): Promise<DBResponse> {
    const query = `
        SELECT 
            C.place_id
        FROM Cafe C
        WHERE   C.place_id LIKE '${place_id}'`;

    return new Promise<DBResponse>(function(
      resolve: (res: DBResponse) => any,
      reject: (err: DBError) => any
    ) {
      Cafe.con.query(query, function(error: any, result: any) {
        if (error) {
          reject({ status: 500, message: error.message });
        } else {
          resolve({ status: 200, result: result[0] });
        }
      });
    });
  }

  saveCafe(
    place_id: string,
    name: string,
    lat: number,
    lng: number,
    address: string
  ): Promise<DBResponse> {
    const query = `
    INSERT INTO Cafe (
      place_id, 
      name, 
      lat, 
      lng, 
      address
    ) VALUES (
        '${place_id}', 
        "${name}", 
        ${lat}, 
        ${lng}, 
        "${address}"
    );`;

    return new Promise<DBResponse>(function(
      resolve: (res: DBResponse) => any,
      reject: (err: DBError) => any
    ) {
      Cafe.con.query(query, function(error: any, result: any) {
        if (error) {
          reject({ status: 500, message: error.message });
        } else {
          resolve({ status: 200, result: {} });
        }
      });
    });
  }

  saveCafes(place_details: PlaceDetail[]): Promise<DBResponse> {
    let query = `
    INSERT INTO Cafe (
      place_id, 
      name, 
      lat, 
      lng, 
      address
    ) VALUES `;

    place_details.map(
      p =>
        (query += `("${p.place_id}", "${p.name}", ${p.lat}, ${p.lng}, "${
          p.formatted_address
        }"),`)
    );
    query = query.substring(0, query.length - 1);

    return new Promise<DBResponse>(function(
      resolve: (res: DBResponse) => any,
      reject: (err: DBError) => any
    ) {
      if (place_details.length == 0)
        reject({ status: 500, message: "Input Cafe empty" });
      Cafe.con.query(query, function(error: any, result: any) {
        if (error) {
          reject({ status: 500, message: error.message });
        } else {
          resolve({ status: 200, result: {} });
        }
      });
    });
  }
}
