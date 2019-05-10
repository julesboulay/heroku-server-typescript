import { DBResponse, DBError } from "./dbresponse";

export default class User {
  static con: any;

  constructor(connection: any) {
    User.con = connection;
  }

  createUser(
    email: string,
    username: string,
    password: string
  ): Promise<DBResponse> {
    const query = `
    INSERT INTO User (
      email, 
      username,
      password,
      sign_up_date
    ) VALUES (
        '${email}', 
        '${username}',
        '${password}', 
        ${User.con.escape(new Date())}
    );`;

    return new Promise<DBResponse>(function(
      resolve: (res: DBResponse) => any,
      reject: (err: DBError) => any
    ) {
      User.con.query(query, function(error: any, result: any) {
        if (error) {
          reject({ status: 500, message: error.message });
        } else {
          resolve({ status: 200, result: {} });
        }
      });
    });
  }

  findUser(email: string): Promise<DBResponse> {
    const query = `
    SELECT 
        email,
        username,
        password
    FROM User
    WHERE email LIKE '${email}';`;

    return new Promise<DBResponse>(function(
      resolve: (res: DBResponse) => any,
      reject: (err: DBError) => any
    ) {
      User.con.query(query, function(error: any, result: any) {
        if (error) {
          reject({ status: 500, message: error.message });
        } else if (result.length < 1) {
          reject({ status: 404, message: "No User with that email" });
        } else {
          resolve({ status: 200, result: result[0] });
        }
      });
    });
  }

  savePost(google_place_id: string, email: string): Promise<DBResponse> {
    const query = `
    INSERT INTO Evaluation (
      google_place_id, 
      email,
      date
    ) VALUES (
        '${google_place_id}', 
        '${email}',
        ${User.con.escape(new Date())}
    );`;

    return new Promise<DBResponse>(function(
      resolve: (res: DBResponse) => any,
      reject: (err: DBError) => any
    ) {
      User.con.query(query, function(error: any, result: any) {
        if (error) {
          reject({ status: 500, message: error.message });
        } else {
          resolve({ status: 200, result: result });
        }
      });
    });
  }
}
