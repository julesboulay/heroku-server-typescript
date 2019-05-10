import * as jwt from "jsonwebtoken";
import { Request, Response } from "express";

import authenticated from "./auth";

import FindCafes from "../pipeline/pipeline";
import { DBResponse, DBError } from "../models/dbresponse";
import User_ from "../models/user";
import Cafe_ from "../models/cafe";
import Eval_ from "../models/evaluation";

import config from "../../config/config";
const secret: any = config("development").secret;

const MAX_PLACES_API_CALLS = 50000;

export default (app: any, connection: any) => {
  const User = new User_(connection);
  const Cafe = new Cafe_(connection);
  const Eval = new Eval_(connection);

  app.get("/search", async (req: Request, res: Response) => {
    await authenticated(req, User)
      .then(authenticated => {
        if (!authenticated) {
          res.status(401).json({ message: "failure", error: "Invalid Token!" });
        } else {
          var { lat, lng, rad } = req.query;
          if (lat === undefined || lng === undefined) {
            res
              .status(400)
              .json({ message: "failure", error: "Invalid Request!" });
          } else if (isNaN(lat) || isNaN(lng)) {
            res
              .status(400)
              .json({ message: "failure", error: "Invalid Request!" });
          } else {
            Eval.getEvaluationsThisMonth(MAX_PLACES_API_CALLS)
              .then((resq: DBResponse) => {
                var query = {
                  lat: Number(lat),
                  lng: Number(lng),
                  rad: Number(rad),
                  token: ""
                };

                FindCafes(query, connection);
                res.status(resq.status).json({ message: "success" });
              })
              .catch((err: DBError) => {
                res
                  .status(err.status)
                  .json({ message: "failure", error: err.message });
              });
          }
        }
      })
      .catch(err => res.status(401).json({ message: "failure", error: err }));
  });

  app.get("/cafes", async (req: any, res: any) => {
    await authenticated(req, User)
      .then(authenticated => {
        if (!authenticated) {
          res.status(401).json({ message: "failure", error: "Invalid Token!" });
        } else {
          var { lat, lng, diff } = req.query;
          if (lat === undefined || lng === undefined) {
            res
              .status(400)
              .json({ message: "failure", error: "Invalid Request!" });
          } else if (isNaN(lat) || isNaN(lng)) {
            res
              .status(400)
              .json({ message: "failure", error: "Invalid Request!" });
          } else {
            Cafe.getCafes(lat, lng, diff)
              .then((resq: DBResponse) => {
                res
                  .status(resq.status)
                  .json({ message: "success", data: resq.result });
              })
              .catch((err: DBError) => {
                res
                  .status(err.status)
                  .json({ message: "failure", error: err.message });
              });
          }
        }
      })
      .catch(err => res.status(401).json({ message: "failure", error: err }));
  });

  app.post("/cafes", async (req: any, res: any) => {
    await authenticated(req, User)
      .then(authenticated => {
        if (!authenticated) {
          res.status(401).json({ message: "failure", error: "Invalid Token!" });
        } else {
          var email: string = "";
          try {
            const decoded = jwt.verify(req.headers["x-access-token"], secret);
            //email = decoded.email;
          } catch (err) {}
          if (!email) {
            res
              .status(401)
              .json({ message: "failure", error: "Invalid Token!" });
          } else {
            var { google_place_id, place_name, lat, lng, address } = req.body;

            Cafe.saveCafe(google_place_id, place_name, lat, lng, address)
              .then((resq: DBResponse) => {
                return User.savePost(google_place_id, email);
              })
              .then((resq: DBResponse) => {
                res
                  .status(resq.status)
                  .json({ message: "success", data: resq.result });
              })
              .catch((err: DBError) => {
                res
                  .status(err.status)
                  .json({ message: "failure", error: err.message });
              });
          }
        }
      })
      .catch(err => res.status(401).json({ message: "failure", error: err }));
  });
};
