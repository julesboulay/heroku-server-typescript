import express from "express";
import { Request, Response } from "express";

import getDBConnection from "./database/connection";
import UserRoutes from "./routes/user";
import CafeRoutes from "./routes/cafes";
import Config from "../config/configType";
import config from "../config/config";
import bodyParser = require("body-parser");

const { NODE_ENV = "develoent", PORT = 3000 } = process.env;
const _config_: Config = config(NODE_ENV);

const connection = getDBConnection(_config_);

const app = express();
app.use(bodyParser.json());
UserRoutes(app, connection);
CafeRoutes(app, connection);
app.get("/health", (req: Request, res: Response) => {
  res.send({ message: "success", data: "Not DeaD YET!" });
});

app.listen(PORT, () =>
  console.log("server started at http://localhost:" + PORT)
);
