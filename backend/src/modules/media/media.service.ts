import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryResponse } from './cloudinary-response';
import * as streamifier from 'streamifier';

@Injectable()
export class MediaService {
  constructor(@Inject('CLOUDINARY') private cloudinaryProvider: any) {}

  async uploadFile(file: any): Promise<any> {
    console.log(`[MEDIA_UPLOAD] Starting upload for: ${file.originalname} (${file.size} bytes)`);
    
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'eldoksh_motors',
        },
        (error, result) => {
          if (error) {
            console.error(`[MEDIA_UPLOAD_ERROR] Cloudinary error for ${file.originalname}:`, error);
            return reject(error);
          }
          if (!result) {
            console.error(`[MEDIA_UPLOAD_ERROR] Cloudinary returned no result for: ${file.originalname}`);
            return reject(new Error('Cloudinary upload failed: No result'));
          }
          
          console.log(`[MEDIA_UPLOAD_SUCCESS] File ${file.originalname} uploaded to: ${result.secure_url}`);
          resolve({ url: result.secure_url });
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  async uploadMultiple(files: any[]): Promise<{ urls: string[] }> {
    const uploadPromises = files.map((file) => this.uploadFile(file));
    const results = await Promise.all(uploadPromises);
    return { urls: results.map((res: any) => res.url) };
  }
}
