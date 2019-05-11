import * as jwt from "jsonwebtoken";

import { DBResponse, DBError } from "../models/dbresponse";
import User from "../models/user";

import config from "../../config/config";
const secret: any = config().secret;

export interface Decode {
  status: number;
  email: string;
  iat: number;
  exp: number;
}

export interface AuthResponse {
  authenticated: boolean;
  email: string;
}

export default async function checkToken(
  req: any,
  _User: User
): Promise<AuthResponse> {
  const token = req.headers["x-access-token"];

  if (token) {
    try {
      var decoded = jwt.verify(token, secret);
      if ((<Decode>decoded).email) {
        let auth: AuthResponse = {
          authenticated: false,
          email: (<Decode>decoded).email
        };
        await _User
          .findUser((<Decode>decoded).email)
          .then(
            (resq: DBResponse) =>
              (auth.authenticated = resq.result ? true : false)
          )
          .catch((resq: DBError) => (auth.authenticated = false));
        return auth;
      } else {
        return { authenticated: false, email: "" };
      }
    } catch (err) {
      return { authenticated: false, email: "" };
    }
  } else {
    return { authenticated: false, email: "" };
  }
}
