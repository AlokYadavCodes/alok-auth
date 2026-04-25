import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";
import ApiError from "./ApiError.js";

async function uploadToCloudinary(file) {
    return new Promise((resolve, reject) => {
        if (!file?.buffer) {
            reject(ApiError.badRequest("Missing file buffer"));
            return;
        }

        const upload = cloudinary.uploader.upload_stream({}, (err, result) => {
            if (err) {
                reject(ApiError.internal("Cloudinary upload failed"));
                return;
            }
            resolve(result?.secure_url);
        });

        Readable.from(file.buffer).pipe(upload);
    });
}

export { uploadToCloudinary };
