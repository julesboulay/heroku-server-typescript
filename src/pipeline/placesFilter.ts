import { Place } from "./placesNearby";

export default function FilterPlaces(places: Place[]): Place[] {
  return places.filter(p => {
    if (p == null || p == undefined) {
      return false;
    } else if (p.name.includes("Starbucks")) {
      return false;
    } else if (p.name.includes("Pacific")) {
      return false;
    } else if (p.user_ratings_total < 50) {
      return false;
    } else if (p.rating < 4.0) {
      return false;
    } else {
      return true;
    }
  });
}
