import { Injectable, ConflictException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserRole } from '../../common/enums';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { NotificationsService } from '../notifications/notifications.service';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private notificationsService: NotificationsService,
  ) {}

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException('Email not registered');
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 15); // 15 minutes expiry

    user.reset_password_token = otp;
    user.reset_password_expires = expires;
    await this.userRepository.save(user);

    // Simulate email sending with OTP
    await this.notificationsService.notify(
      'Password Reset Code',
      `Your verification code is: ${otp}. It will expire in 15 minutes.`,
      user.id,
      { type: 'reset_password_otp', otp }
    );

    return { message: 'Verification code sent' };
  }

  async verifyResetCode(token: string) {
    const user = await this.userRepository.createQueryBuilder('user')
      .addSelect('user.reset_password_token')
      .addSelect('user.reset_password_expires')
      .where('user.reset_password_token = :token', { token })
      .getOne();

    if (!user || !user.reset_password_expires || user.reset_password_expires < new Date()) {
      throw new ConflictException('Invalid or expired code');
    }

    return { valid: true };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, new_password } = resetPasswordDto;

    const user = await this.userRepository.createQueryBuilder('user')
      .addSelect('user.reset_password_token')
      .addSelect('user.reset_password_expires')
      .where('user.reset_password_token = :token', { token })
      .getOne();

    if (!user || !user.reset_password_expires || user.reset_password_expires < new Date()) {
      throw new ConflictException('Invalid or expired code');
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);
    user.password_hash = hashedPassword;
    user.reset_password_token = null;
    user.reset_password_expires = null;

    await this.userRepository.save(user);

    return { message: 'Password successfully reset' };
  }

  async register(registerDto: RegisterDto) {
    const { email, password, name, phone, role, address } = registerDto;

    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.userRepository.create({
      name,
      email,
      phone,
      address,
      password_hash: hashedPassword,
      role: role || UserRole.CUSTOMER,
    });

    await this.userRepository.save(user);

    return this.generateToken(user);
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userRepository.createQueryBuilder('user')
      .addSelect('user.password_hash')
      .where('user.email = :email', { email })
      .getOne();

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateToken(user);
  }

  private generateToken(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
      },
    };
  }
}
