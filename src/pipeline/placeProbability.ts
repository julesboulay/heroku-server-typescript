import { PhotoDetail } from "./placesPhotos";

const PROB: number = 0.9;

export interface PhotoProbability {
  name: string;
  photo_reference: string;
  probability: number;
}
// Python Request for Photo
export function getImageProb(
  photo_detail: PhotoDetail,
  pipeline_error: string[]
): Promise<PhotoProbability> {
  return new Promise<PhotoProbability>((resolve, reject) => {
    let { name, photo_reference } = photo_detail;
    let photo_prob: PhotoProbability = {
      name,
      photo_reference,
      probability: PROB
    };
    setTimeout(() => resolve(photo_prob), 1000);
  });
}
