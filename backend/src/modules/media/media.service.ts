import { Injectable, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryResponse } from './cloudinary-response';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';

@Injectable()
export class MediaService {
  async uploadFile(file: any): Promise<any> {
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'vehicles');
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }

    const fileName = `${randomUUID()}-${file.originalname}`;
    const filePath = join(uploadDir, fileName);

    return new Promise((resolve, reject) => {
      const writeStream = createWriteStream(filePath);
      writeStream.write(file.buffer);
      writeStream.end();

      writeStream.on('finish', () => {
        const url = `/uploads/vehicles/${fileName}`;
        resolve({ url });
      });

      writeStream.on('error', (error) => {
        console.error('LOCAL UPLOAD ERROR:', error);
        reject(error);
      });
    });
  }

  async uploadMultiple(files: any[]): Promise<{ urls: string[] }> {
    const uploadPromises = files.map((file) => this.uploadFile(file));
    const results = await Promise.all(uploadPromises);
    return { urls: results.map((res: any) => res.url) };
  }
}
