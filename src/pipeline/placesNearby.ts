import * as https from "https";
import config from "../../config/config";
const places_key: any = config("development").google_places_api_key;

function placesNearbyQuery(q: Query): string {
  if (q.token == null || q.token == undefined || q.token == "") {
    var location: string = q.lat + "," + q.lng;
    var rad: number =
      q.rad == null || q.rad == undefined || q.rad < 0 ? 16000 : q.rad;
    return (
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=${places_key}` +
      `&location=${location}&radius=${rad}&types=cafe`
    );
  } else {
    return (
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=${places_key}` +
      `&pagetoken=${q.token}`
    );
  }
}

export interface Place {
  place_id: string;
}

export interface Query {
  lat: number;
  lng: number;
  rad: number;
  token: string;
}
export function getPlacesNearby(
  query: Query,
  callback: (locs: Place[], err: string) => any,
  page_num = 1
): any {
  var url: string = placesNearbyQuery(query);
  https
    .get(url, function(response: any) {
      var body: string = "";
      response.on("data", function(chunk: string) {
        body += chunk;
      });

      response.on("end", function() {
        var places = JSON.parse(body);
        var locations = places.results;

        if (places.status != "OK") {
          callback([], "Google Places error: " + places.status);
        } else if (page_num < 3 && locations.length == 20) {
          query.token = places.next_page_token;
          callback(locations, "");
          setTimeout(
            () => getPlacesNearby(query, callback, page_num + 1),
            2000
          );
        } else {
          callback(locations, "");
        }
      });
    })
    .on("error", function(e: any) {
      callback([], "Got error: " + e.message);
    });
}
