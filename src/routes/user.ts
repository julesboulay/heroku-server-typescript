import auth from "basic-auth";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";

import { DBResponse, DBError } from "../models/dbresponse";
import User from "../models/user";

import config from "../../config/config";
const secret: any = config().secret;

export default (app: any, connection: any) => {
  const _User = new User(connection);

  app.post("/authenticate", (req: any, res: any) => {
    const credentials = auth(req);

    if (!credentials) {
      res.status(400).json({ message: "failure", error: "Invalid Request!" });
    } else {
      const { name, pass } = credentials;
      _User
        .findUser(name)
        .then((resq: DBResponse) => {
          const { email, password } = resq.result;
          if (bcrypt.compareSync(pass, password)) {
            const token = jwt.sign({ status: 200, email }, secret, {
              expiresIn: 1440
            });
            res.status(resq.status).json({ message: "success", token });
          } else {
            res
              .status(401)
              .json({ message: "failure", error: "Invalid Credentials!" });
          }
        })
        .catch((err: DBError) => {
          res
            .status(err.status)
            .json({ message: "failure", error: err.message });
        });
    }
  });

  app.post("/users", (req: any, res: any) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      res.status(400).json({ message: "failure", error: "Invalid Request!" });
    } else if (!username.trim() || !email.trim() || !password.trim()) {
      res.status(400).json({ message: "failure", error: "Invalid Request!" });
    } else {
      const salt = bcrypt.genSaltSync(10);
      const hash_password = bcrypt.hashSync(password, salt);

      _User
        .createUser(email, username, hash_password)
        .then((resq: DBResponse) => {
          res.setHeader("Location", "/users/" + email);
          res.status(resq.status).json({ message: "success" });
        })
        .catch((err: DBError) => {
          res
            .status(err.status)
            .json({ message: "failure", error: err.message });
        });
    }
  });
};
