import { getPlacesNearby, Query, Place } from "./placesNearby";
import { getPlaceDetails, PlaceDetail } from "./placesDetails";
import { getPlacesPhotos, PhotoDetail } from "./placesPhotos";
import {
  PhotoProbability,
  getImageProb,
  requestDownloadImagesProbabilities
} from "./placeProbability";

import filterPlaces from "./placesFilter";
import { DBResponse, DBError } from "../models/dbresponse";
import Cafe from "../models/cafe";
import Eval from "../models/evaluation";

/**
 * Search for evaluation_id during insert with google_place_id
 * Change all dates to datetime
 *
 * Python Queue instead of Node Queue (only for download requests)
 */

/***************************************************************************
 * The Pipeline
 */
export default function FindCafes(
  query: Query,
  _Cafe: Cafe,
  _Eval: Eval
): void {
  getPlacesNearby(query, function(places: Place[], error: string) {
    console.log("Recieved " + places.length + " Places");
    // Error Check

    let place_mysql_promises = [];
    for (let i = 0; i < places.length; i++)
      place_mysql_promises.push(
        new Promise<Place>(function(resolve: (p: Place | any) => any, reject) {
          _Cafe
            .getCafe(places[i].place_id)
            .then((resq: DBResponse) => {
              if (resq.result) resolve(null);
              else resolve(places[i]);
            })
            .catch((err: DBError) => reject(err.message));
        })
      );

    Promise.all<Place>(place_mysql_promises)
      .then(
        (places: Place[]): Place[] => {
          places = filterPlaces(places);
          return places;
        }
      )
      .then(
        (places: Place[]): Promise<PlaceDetail[]> => {
          console.log("Evaluating " + places.length + " Places");

          return new Promise<PlaceDetail[]>(function(resolve, reject) {
            // Get Details For Every Place
            let place_details_promises: Promise<PlaceDetail>[] = [];
            for (let i = 0; i < places.length; i++)
              place_details_promises.push(getPlaceDetails(places[i], reject));

            resolve(Promise.all<PlaceDetail>(place_details_promises));
          });
        }
      )
      .then(
        (place_details: PlaceDetail[]): Promise<PlaceDetail[]> => {
          return new Promise<PlaceDetail[]>(async function(resolve, reject) {
            console.log("Details From " + place_details.length + " Places");

            // Save Cafes to MySQL
            if (place_details.length == 0) reject("All Cafes Saved");
            _Cafe
              .saveCafes(place_details)
              .then((resq: DBResponse) => resolve(place_details))
              .catch((err: DBError) => reject(err.message));
          });
        }
      )
      .then(
        (place_details: PlaceDetail[]): Promise<PlaceDetail[]> => {
          return new Promise<PlaceDetail[]>(async function(resolve, reject) {
            console.log("Cafe & Eval Saved: " + place_details.length);

            // Save Evaluations to MySQL
            _Eval
              .saveEvaluations(place_details)
              .then((resq: DBResponse) => resolve(place_details))
              .catch((err: DBError) => reject(err.message));
          });
        }
      )
      .then(
        (place_details: PlaceDetail[]): Promise<PlaceDetail[]> => {
          console.log("Cafe & Eval Saved: " + place_details.length);

          // Send Python Download Prob Request For Every Place
          return requestDownloadImagesProbabilities(place_details);
        }
      )
      .then(
        (place_details: PlaceDetail[]): Promise<PhotoDetail[][]> => {
          console.log("Python Download Queued :" + place_details.length);
          // Get Photos From Every Place
          return new Promise<PhotoDetail[][]>(function(
            resolve,
            reject: (s: string) => any
          ) {
            let photo_details_promises: Promise<PhotoDetail[]>[] = [];
            for (let i = 0; i < place_details.length; i++)
              photo_details_promises.push(
                getPlacesPhotos(place_details[i], reject)
              );

            resolve(Promise.all<PhotoDetail[]>(photo_details_promises));
          });
        }
      )
      .then(
        (photo_details_2D: PhotoDetail[][]): PhotoDetail[] => {
          // Turn 2D Photos Array Into ID Array
          let photo_details_1D: PhotoDetail[] = [];
          for (let i = 0; i < photo_details_2D.length; i++)
            for (let j = 0; j < photo_details_2D[i].length; j++)
              photo_details_1D.push(photo_details_2D[i][j]);
          return photo_details_1D;
        }
      )
      .then(
        (photo_details: PhotoDetail[]): Promise<PhotoProbability[]> => {
          console.log("Photos To Process: " + photo_details.length);

          return new Promise<PhotoProbability[]>(function(resolve, reject) {
            // Send Python Image Prob Request For Every Photo
            let place_requests_promises: Promise<PhotoProbability>[] = [];
            for (let i = 0; i < photo_details.length; i++)
              place_requests_promises.push(
                getImageProb(photo_details[i], reject)
              );

            resolve(Promise.all<PhotoProbability>(place_requests_promises));
          });
        }
      )
      .then(
        (photo_probs: PhotoProbability[]): Promise<void> => {
          console.log("Python Image Requests Recieved: " + photo_probs.length);
          return new Promise<void>(async function(resolve, reject) {
            // Save Photo Evaluations to MySQL
            _Eval
              .saveEvaluatedPictures(photo_probs)
              .then((resq: DBResponse) => resolve())
              .catch((err: DBError) => reject(err.message));
          });
        }
      )
      .catch(err => console.log(err));
  });
}
