import * as jwt from "jsonwebtoken";

import { DBResponse, DBError } from "../models/dbresponse";
import User_ from "../models/user";

import config from "../../config/config";
const secret: any = config("production").secret;

export interface Decode {
  status: number;
  email: string;
  iat: number;
  exp: number;
}

export default async function checkToken(
  req: any,
  User: User_
): Promise<boolean> {
  const token = req.headers["x-access-token"];

  if (token) {
    try {
      var decoded = jwt.verify(token, secret);
      if ((<Decode>decoded).email) {
        let user_exits: boolean = false;
        await User.findUser((<Decode>decoded).email)
          .then((resq: DBResponse) => (user_exits = resq.result ? true : false))
          .catch((resq: DBError) => (user_exits = false));
        return user_exits;
      } else {
        return false;
      }
    } catch (err) {
      return false;
    }
  } else {
    return false;
  }
}
