import { Injectable, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryResponse } from './cloudinary-response';
import * as streamifier from 'streamifier';

@Injectable()
export class MediaService {
  async uploadFile(file: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'eldoksh_motors',
        },
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error('Cloudinary upload failed: No result'));
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
