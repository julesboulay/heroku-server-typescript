import * as https from "https";
import { Place } from "./placesNearby";
import config from "../../config/config";
const places_key: any = config().google_places_api_key;

function placesDetailsQuery(placeid: string): string {
  return (
    `https://maps.googleapis.com/maps/api/place/details/json?` +
    `key=${places_key}&placeid=${placeid}&language=english`
  );
}

export interface PlaceDetail {
  place_id: string;
  name: string;
  lat: number;
  lng: number;
  address: string;
  photos: { photo_reference: string }[];
  address_components: [{ types: [string]; short_name: string }];
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
            place_id: result.place_id,
            name: result.name,
            lat: result.geometry.location.lat,
            lng: result.geometry.location.lng,
            address: result.formatted_address,
            photos: result.photos || [],
            address_components: result.address_components || []
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
