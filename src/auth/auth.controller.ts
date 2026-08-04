import { Body, Controller, Post, Put } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDTO, UpdatePasswordDTO } from '../dtos/auth';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signin')
  async signin(@Body() body: SignInDTO) {
    return await this.authService.signin(body);
  }

  @Put('update-password')
  async updatePassword(@Body() body: UpdatePasswordDTO) {
    return await this.authService.updatePassword(body);
  }
}
