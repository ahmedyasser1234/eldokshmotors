import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserDocument } from '../users/entities/user-document.entity';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(UserDocument)
    private documentRepository: Repository<UserDocument>,
  ) {}

  async findAll() {
    return this.documentRepository.find({ relations: ['user'] });
  }

  async findByUser(userId: string) {
    return this.documentRepository.find({ where: { user: { id: userId } } });
  }

  async updateStatus(id: string, isVerified: boolean) {
    const doc = await this.documentRepository.findOne({ where: { id } });
    if (!doc) throw new NotFoundException('Document not found');
    doc.verified = isVerified;
    return this.documentRepository.save(doc);
  }

  async uploadDocument(userId: string, data: { type: string, url: string }) {
    const doc = this.documentRepository.create({
      user: { id: userId },
      document_type: data.type,
      file_url: data.url,
      verified: false,
    });
    return this.documentRepository.save(doc);
  }
}
