import { getPlacesNearby, Query, Place } from "./placesNearby";
import { getPlaceDetails, PlaceDetail } from "./placesDetails";
import { getPlacesPhotos, PhotoDetail } from "./placesPhotos";
import { PhotoProbability, getImageProb } from "./placeProbability";

/**
 * Search for evaluation_id during insert with google_place_id
 * Change all dates to datetime
 *
 * Python Queue instead of Node Queue (only for download requests)
 */

/***************************************************************************
 * The Pipeline
 */
export default function FindCafes(query: Query, connection: any): void {
  getPlacesNearby(query, function(places: Place[], error: string) {
    // Error Check
    let pipeline_error: string[] = [];
    function check_pipeline_error(): void {
      if (pipeline_error.length > 0) {
        let error: string = "";
        for (let i = 0; i < pipeline_error.length; i++)
          error += pipeline_error + "\n";
        throw error;
      }
    }

    // Get Details For Every Place
    let place_details_promises: Promise<PlaceDetail>[] = [];
    for (let i = 0; i < places.length; i++)
      place_details_promises.push(getPlaceDetails(places[i], pipeline_error));

    Promise.all<PlaceDetail>(place_details_promises)
      .then(
        (place_details: PlaceDetail[]): Promise<PlaceDetail[]> => {
          check_pipeline_error();
          return new Promise<PlaceDetail[]>(async function(resolve, reject) {
            // Save Details to MySQL
            // ####### TODO ########
            resolve(place_details);
          });
        }
      )
      .then(
        (place_details: PlaceDetail[]): Promise<PlaceDetail[]> => {
          return new Promise<PlaceDetail[]>(async function(resolve, reject) {
            // Save Evaluations to MySQL
            // ####### TODO ########
            resolve(place_details);
          });
        }
      )
      .then(
        (place_details: PlaceDetail[]): Promise<PlaceDetail[]> => {
          return new Promise<PlaceDetail[]>(async function(resolve, reject) {
            // Send Python Download Prob Request For Every Place
            // ####### TODO ########
            resolve(place_details);
          });
        }
      )
      .then(
        (place_details: PlaceDetail[]): Promise<PhotoDetail[][]> => {
          // Get Photos From Every Place
          let photo_details_promises: Promise<PhotoDetail[]>[] = [];
          for (let i = 0; i < place_details.length; i++)
            photo_details_promises.push(
              getPlacesPhotos(place_details[i], pipeline_error)
            );

          return Promise.all<PhotoDetail[]>(photo_details_promises);
        }
      )
      .then(
        (photo_details_2D: PhotoDetail[][]): PhotoDetail[] => {
          // Turn 2D Photos Array Into ID Array
          check_pipeline_error();
          let photo_details_1D: PhotoDetail[] = [];
          for (let i = 0; i < photo_details_2D.length; i++)
            for (let j = 0; j < photo_details_2D[i].length; j++)
              photo_details_1D.push(photo_details_2D[i][j]);
          return photo_details_1D;
        }
      )
      .then(
        (photo_details: PhotoDetail[]): Promise<PhotoProbability[]> => {
          // Send Python Image Prob Request For Every Photo
          let place_requests_promises: Promise<PhotoProbability>[] = [];
          for (let i = 0; i < photo_details.length; i++)
            place_requests_promises.push(
              getImageProb(photo_details[i], pipeline_error)
            );

          return Promise.all<PhotoProbability>(place_requests_promises);
        }
      )
      .then(
        (photo_probs: PhotoProbability[]): Promise<void> => {
          check_pipeline_error();
          return new Promise<void>(async function(resolve, reject) {
            // Save Photo Evaluations to MySQL
            // ####### TODO ########
            console.log(photo_probs);
            resolve();
          });
        }
      )
      .catch(err => console.log(err));
  });
}
