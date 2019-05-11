import * as jwt from "jsonwebtoken";
import { Request, Response } from "express";

import authenticated, { AuthResponse } from "./auth";

import FindCafes from "../pipeline/pipeline";
import { DBResponse, DBError } from "../models/dbresponse";
import User from "../models/user";
import Cafe from "../models/cafe";
import Eval from "../models/evaluation";

import config from "../../config/config";
const secret: any = config().secret;

const MAX_PLACES_API_CALLS = 50000;

export default (app: any, connection: any) => {
  const _User = new User(connection);
  const _Cafe = new Cafe(connection);
  const _Eval = new Eval(connection);

  app.get("/search", async (req: Request, res: Response) => {
    await authenticated(req, _User)
      .then(({ authenticated, email }: AuthResponse) => {
        if (!authenticated) {
          res
            .status(401)
            .json({ messsage: "failure", error: "Invalid Token!" });
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
            _Eval
              .getEvaluationsThisMonth()
              .then((resq: DBResponse) => {
                let evals = resq.result.length;
                let num_of_api_calls_this_month = evals + evals + 10 * evals;
                if (num_of_api_calls_this_month > MAX_PLACES_API_CALLS) {
                  throw {
                    status: 429,
                    message: "Number of API calls exceeded."
                  };
                } else {
                  var query = {
                    lat: Number(lat),
                    lng: Number(lng),
                    rad: Number(rad),
                    token: ""
                  };

                  FindCafes(query, _Cafe, _Eval);
                  res.status(resq.status).json({ message: "success" });
                }
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
    await authenticated(req, _User)
      .then(({ authenticated, email }: AuthResponse) => {
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
            _Cafe
              .getCafes(lat, lng, diff)
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
    await authenticated(req, _User)
      .then(({ authenticated, email }: AuthResponse) => {
        if (!authenticated) {
          res.status(401).json({ message: "failure", error: "Invalid Token!" });
        } else {
          var { place_id, name, lat, lng, address } = req.body;

          _Cafe
            .saveCafe(place_id, name, lat, lng, address)
            .then((resq: DBResponse) => {
              return _User.savePost(place_id, email);
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
      })
      .catch(err => res.status(401).json({ message: "failure", error: err }));
  });
};
