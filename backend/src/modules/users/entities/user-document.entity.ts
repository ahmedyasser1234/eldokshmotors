import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('user_documents')
export class UserDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.documents)
  user: User;

  @Column()
  document_type: string; // 'license', 'passport', 'id'

  @Column()
  file_url: string;

  @Column({ default: false })
  verified: boolean;

  @CreateDateColumn()
  created_at: Date;
}
