import { PhotoDetail } from "./placesPhotos";
import request = require("request");
import config from "../../config/config";
import { PlaceDetail } from "./placesDetails";

export interface PhotoProbability {
  place_id: string;
  photo_reference: string;
  marzocco_likelihood: number;
}

function determinePlaceSuffix(place_detail: PlaceDetail): string {
  let suffix: string = " ,";
  if (place_detail.address_components)
    place_detail.address_components.map(({ types, short_name }) => {
      if (types)
        types.map(t => {
          if (t == "administrative_area_level_1") suffix += short_name + ", ";
          else if (t == "administrative_area_level_2")
            suffix += short_name + ", ";
          else if (t == "locality") suffix += short_name + ", ";
          else if (t == "neighborhood") suffix += short_name + ", ";
        });
    });
  return suffix;
}

export function requestDownloadImagesProbabilities(
  place_details: PlaceDetail[]
): Promise<PlaceDetail[]> {
  return new Promise<PlaceDetail[]>(function(resolve, reject) {
    let place_requests = place_details.map(p => {
      return {
        place_id: p.place_id,
        place_name: p.name,
        place_suffix: determinePlaceSuffix(p)
      };
    });
    // 2. Python Download IMGs Predictions
    request.post(
      config().python_server.url + "/predictdownload",
      {
        json: { places: place_requests }
      },
      function(error, res, body) {
        if (error) {
          reject(error);
        } else if (!body.message) {
          reject("Heroku Internal Error");
        } else if (body.message != "success") {
          reject(body.error);
        } else {
          resolve(place_details);
        }
      }
    );
  });
}

// Python Request for Photo
export function getImageProb(
  photo_detail: PhotoDetail,
  reject_: (s: string) => any
): Promise<PhotoProbability> {
  return new Promise<PhotoProbability>((resolve, reject) => {
    const { place_id, base64, photo_reference } = photo_detail;

    request.post(
      config().python_server.url + "/predictimage",
      {
        json: {
          type: "Buffer",
          photo_reference: photo_reference,
          data: base64
        }
      },
      function(error, res, body) {
        if (error) {
          reject_(error);
        } else if (!body.message) {
          reject_("Heroku Internal Error");
        } else if (body.message != "success") {
          reject_(body.error);
        } else {
          const { marzocco_probability } = body;
          let photo_prob: PhotoProbability = {
            place_id,
            photo_reference,
            marzocco_likelihood: marzocco_probability
          };
          resolve(photo_prob);
        }
      }
    );
  });
}
