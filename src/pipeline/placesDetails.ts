import * as https from "https";
import { Place } from "./placesNearby";
import config from "../../config/config";
const places_key: any = config("development").google_places_api_key;

function placesDetailsQuery(placeid: string): string {
  return (
    `https://maps.googleapis.com/maps/api/place/details/json?` +
    `key=${places_key}&placeid=${placeid}&language=english`
  );
}

export interface PlaceDetail {
  name: string;
  place_id: string;
  photos: { photo_reference: string }[];
}

export function getPlaceDetails(
  place: Place,
  pipeline_error: string[]
): Promise<PlaceDetail> {
  return new Promise<PlaceDetail>((resolve, reject) => {
    var url: string = placesDetailsQuery(place.place_id);
    https
      .get(url, function(response: any) {
        var body: string = "";
        response.on("data", function(chunk: string) {
          body += chunk;
        });

        response.on("end", function() {
          var { result } = JSON.parse(body);

          let place_detail: PlaceDetail = {
            name: result.name,
            place_id: result.place_id,
            photos: result.photos || []
          };
          resolve(place_detail);
        });
      })
      .on("error", function(e: any) {
        pipeline_error.push(e.message);
        reject("Got error: " + e.message);
      });
  });
}
