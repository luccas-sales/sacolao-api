import { Body, Controller, Get, Headers, Post, Put } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDTO, UpdatePasswordDTO } from '../dtos/auth';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('check-session')
  async checkSession(@Headers('authorization') authHeader: string) {
    return await this.authService.checkSession(authHeader);
  }

  @Post('signin')
  async signin(@Body() body: SignInDTO) {
    return await this.authService.signin(body);
  }

  @Post('logout')
  async logout(@Body() body: { sessionId: string }) {
    return await this.authService.logoutSession(body.sessionId);
  }

  @Put('update-password')
  async updatePassword(@Body() body: UpdatePasswordDTO) {
    return await this.authService.updatePassword(body);
  }
}
