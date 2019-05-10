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
    marzocco_likelihood = 0.5
  ): Promise<DBResponse> {
    if (diff == undefined || isNaN(diff)) diff = 5;
    var n = lat + diff,
      s = lat - diff,
      e = lng + diff * 2,
      w = lng - diff * 2;

    const query = `
      SELECT
        C.google_place_id, 
        C.place_name, 
        C.lat, 
        C.lng, 
        C.address
      FROM Cafe C, Evaluation E
      WHERE
        C.lat < ${n} AND
        C.lat > ${s} AND
        C.lng < ${e} AND
        C.lng > ${w} AND (
        E.evaluation_id IN (
          SELECT EP.evaluation_id
          FROM Evaluation E, EvaluatedPicture EP
          WHERE
            E.evaluation_id = EP.evaluation_id AND
            EP.marzocco_likelihood > ${marzocco_likelihood}
          GROUP BY EP.evaluation_id
        ) OR
        C.google_place_id IN (
          SELECT google_place_id FROM Post))
      GROUP BY C.google_place_id
      ORDER BY C.google_place_id DESC;`;

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

  getCafe(placeid: string): Promise<DBResponse> {
    const query = `
        SELECT 
            C.google_place_id
        FROM Cafe C
        WHERE   C.google_place_id LIKE '${placeid}'`;

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
    google_place_id: string,
    place_name: string,
    lat: number,
    lng: number,
    address: string
  ): Promise<DBResponse> {
    const query = `
    INSERT INTO Cafe (
      google_place_id, 
      place_name, 
      lat, 
      lng, 
      address
    ) VALUES (
        '${google_place_id}', 
        "${place_name}", 
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
    const query = `
    INSERT INTO Cafe (
      google_place_id, 
      place_name, 
      lat, 
      lng, 
      address
    ) VALUES ?`;

    let insert: any = place_details.map(p => [
      p.place_id,
      p.name,
      p.lat,
      p.lng,
      p.address
    ]);
    return new Promise<DBResponse>(function(
      resolve: (res: DBResponse) => any,
      reject: (err: DBError) => any
    ) {
      Cafe.con.query(query, [insert], function(error: any, result: any) {
        if (error) {
          reject({ status: 500, message: error.message });
        } else {
          resolve({ status: 200, result: {} });
        }
      });
    });
  }
}
