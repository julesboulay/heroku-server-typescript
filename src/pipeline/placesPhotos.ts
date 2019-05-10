import * as https from "https";
import * as fs from "fs";
import download, { Options } from "./images/imageDownloader";
import { PlaceDetail } from "././placesDetails";
import config from "../../config/config";
const places_key: any = config("development").google_places_api_key;

const PIXELS = 300;

function placesPhotoQuery(photo_reference: string) {
  return (
    `https://maps.googleapis.com/maps/api/place/photo?key=${places_key}` +
    `&maxwidth=${PIXELS}&maxheight=${PIXELS}&photoreference=${photo_reference}`
  );
}

export interface PhotoDetail {
  name: string;
  photo_reference: string;
  base64: string;
}

function downloadPhoto(
  photo_detail: PhotoDetail,
  _url: string,
  pipeline_error: string[],
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
          pipeline_error.push(String(err));
          reject(err);
        }

        fs.unlink(options.dest, function(err) {
          if (err) {
            pipeline_error.push(String(err));
            reject(err);
          }
        });

        photo_detail.base64 = data.toString("base64");
        resolve(photo_detail);
      });
    })
    .catch((err: any) => {
      pipeline_error.push(String(err));
      reject("Error on download: " + err);
    });
}

function getPhoto(
  name: string,
  photo_reference: string,
  pipeline_error: string[]
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
          name,
          photo_reference,
          base64: ""
        };
        response.on("end", function() {
          downloadPhoto(
            photo_detail,
            photoURL,
            pipeline_error,
            resolve,
            reject
          );
        });
      })
      .on("error", function(e) {
        pipeline_error.push(e.message);
        reject("Got error: " + e.message);
      });
  });
}

// Get Photos
export function getPlacesPhotos(
  place_detail: PlaceDetail,
  pipeline_error: string[]
): Promise<PhotoDetail[]> {
  return new Promise<PhotoDetail[]>(function(resolve, reject) {
    let photos_details_promises: Promise<PhotoDetail>[] = [];
    let { name, photos } = place_detail;
    for (let i = 0; i < photos.length; i++)
      photos_details_promises.push(
        getPhoto(name, photos[i].photo_reference, pipeline_error)
      );

    Promise.all(photos_details_promises).then(photo_details =>
      resolve(photo_details)
    );
  });
}
