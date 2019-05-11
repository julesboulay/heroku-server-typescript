import { DBResponse, DBError } from "../models/dbresponse";
import Eval from "../models/evaluation";
import { PhotoProbability } from "../pipeline/placeProbability";

export default (app: any, connection: any) => {
  const _Eval = new Eval(connection);

  app.post("/predictions", (req: any, res: any) => {
    const { message, predictions } = req.body;

    if (!message) {
      res.status(400).json({ message: "failure", error: "Empty Request!" });
    } else if (message == "failure") {
      res.status(200).json({ message: "success" });
    } else if (message == "success" && !(<PhotoProbability[]>predictions)) {
      res
        .status(400)
        .json({ message: "failure", error: "No Predictions Sent!" });
    } else {
      let probs: PhotoProbability[] = <PhotoProbability[]>predictions;
      if (probs.length < 1) {
        res.status(200).json({ message: "success", error: "No Predictions" });
      } else if (
        !probs[0].place_id ||
        !probs[0].photo_reference ||
        !probs[0].marzocco_likelihood
      ) {
        res.status(400).json({ message: "failure", error: "Wrong Format!" });
      } else {
        probs = probs.map(p => {
          p.photo_reference =
            String(connection.escape(new Date())) + "_" + p.photo_reference;
          return p;
        });

        console.log("Evaluated Download Pictures: " + probs.length);
        _Eval
          .saveEvaluatedPictures(probs)
          .then((resq: DBResponse) => {
            res.status(resq.status).json({ message: "success" });
          })
          .catch((err: DBError) => {
            res
              .status(err.status)
              .json({ message: "failure", error: err.message });
          });
      }
    }
  });
};
