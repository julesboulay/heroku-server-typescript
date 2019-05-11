import * as https from "https";
import * as fs from "fs";
import download, { Options } from "./images/imageDownloader";
import { PlaceDetail } from "././placesDetails";
import config from "../../config/config";
const places_key: any = config().google_places_api_key;

const PIXELS = 300;

function placesPhotoQuery(photo_reference: string) {
  return (
    `https://maps.googleapis.com/maps/api/place/photo?key=${places_key}` +
    `&maxwidth=${PIXELS}&maxheight=${PIXELS}&photoreference=${photo_reference}`
  );
}

export interface PhotoDetail {
  place_id: string;
  photo_reference: string;
  base64: string;
}

function downloadPhoto(
  photo_detail: PhotoDetail,
  _url: string,
  resolve: (photo: PhotoDetail) => any,
  reject: (err: any) => any
) {
  const options: Options = {
    url: _url,
    dest: "./src/pipeline/images/" + photo_detail.photo_reference + ".jpg",
    done: (err: any, filename: any, image: any) => {},
    encoding: null
  };
  download
    .image(options)
    .then(() => {
      fs.readFile(options.dest, function(err, data) {
        if (err) {
          reject(String(err));
          reject(err);
        }

        fs.unlink(options.dest, function(err) {
          if (err) {
            reject(String(err));
            reject(err);
          }
        });

        photo_detail.base64 = data.toString("base64");
        resolve(photo_detail);
      });
    })
    .catch((err: any) => {
      reject("Error on download: " + err);
    });
}

function getPhoto(
  place_id: string,
  photo_reference: string,
  reject_: (s: string) => any
): Promise<PhotoDetail> {
  return new Promise<PhotoDetail>((resolve, reject) => {
    var url: string = placesPhotoQuery(photo_reference);
    https
      .get(url, function(response) {
        var photoURL: string = "";
        response.on("data", function(chunk) {
          photoURL += response.headers.location;
        });

        let photo_detail: PhotoDetail = {
          place_id,
          photo_reference,
          base64: ""
        };
        response.on("end", function() {
          downloadPhoto(photo_detail, photoURL, resolve, reject);
        });
      })
      .on("error", function(e) {
        reject_("Got error: " + e.message);
      });
  }).catch(err => reject_("Got error: " + err));
}

// Get Photos
export function getPlacesPhotos(
  place_detail: PlaceDetail,
  reject_: (s: string) => any
): Promise<PhotoDetail[]> {
  return new Promise<PhotoDetail[]>(function(resolve, reject) {
    let photos_details_promises: Promise<PhotoDetail>[] = [];
    let { place_id, photos } = place_detail;
    for (let i = 0; i < photos.length; i++)
      photos_details_promises.push(
        getPhoto(place_id, photos[i].photo_reference, reject_)
      );

    Promise.all(photos_details_promises).then(photo_details =>
      resolve(photo_details)
    );
  }).catch(err => reject_("Got error: " + err));
}
