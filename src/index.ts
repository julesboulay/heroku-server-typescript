import express from "express";
import { Request, Response } from "express";
import bodyParser = require("body-parser");

import UserRoutes from "./routes/user";
import CafeRoutes from "./routes/cafes";
import ProbRoutes from "./routes/predictions";

import getDBConnection from "./database/connection";
import config from "../config/config";

/**
 * TODO
 * - Finish Model
 * - Sort Download Python Requests Order By Cafe's Ratings
 * - Flutter Client
 * - Config File & Var for Production
 *
 * - Add Splunk logging
 * - Fix Python Model Loading
 */

const { PORT = 3000 } = process.env;
const connection = getDBConnection(config());

const app = express();
app.use(bodyParser.json());
UserRoutes(app, connection);
CafeRoutes(app, connection);
ProbRoutes(app, connection);
app.get("/health", (req: Request, res: Response) => {
  res.send({ message: "success", data: "Not DeaD YET!" });
});

app.listen(PORT, () =>
  console.log("server started at http://localhost:" + PORT)
);
