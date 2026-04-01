import { Controller, Post, Body, HttpCode, HttpStatus, Get, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log in a user' })
  @ApiResponse({ status: 200, description: 'User successfully logged in' })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // --- Social Login Routes ---

  @Get('google')
  @ApiOperation({ summary: 'Login with Google' })
  googleAuth() {
    // Placeholder for Google redirect
    // @UseGuards(AuthGuard('google'))
  }

  @Get('google/callback')
  googleAuthCallback() {
    // Placeholder for Google callback logic
    // @UseGuards(AuthGuard('google'))
  }

  @Get('facebook')
  @ApiOperation({ summary: 'Login with Facebook' })
  facebookAuth() {
    // Placeholder for Facebook redirect
  }

  @Get('facebook/callback')
  facebookAuthCallback() {
    // Placeholder logic
  }

  @Get('instagram')
  @ApiOperation({ summary: 'Login with Instagram' })
  instagramAuth() {
    // Placeholder logic
  }

  @Get('tiktok')
  @ApiOperation({ summary: 'Login with TikTok' })
  tiktokAuth() {
    // Placeholder logic
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({ status: 200, description: 'Reset link sent' })
  forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Get('verify-code')
  @ApiOperation({ summary: 'Verify reset code' })
  verifyCode(@Query('token') token: string) {
    return this.authService.verifyResetCode(token);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password using token' })
  @ApiResponse({ status: 200, description: 'Password successfully reset' })
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }
}
