import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { AuthDto, ForgotPasswordDto, ResetPasswordDto } from 'src/auth/dto';
import { type AuthToken } from 'src/auth/entities';
import JwtAuthGuard from 'src/auth/guards/jwt-auth.guard';
import JwtRefreshGuard from 'src/auth/guards/jwt-refresh.guard';
import { CreateUserDto } from 'src/users/dto';
import { type PendingUserWithoutPassword } from 'src/users/entities';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() createUserDto: CreateUserDto,
  ): Promise<PendingUserWithoutPassword> {
    const pendingUser = await this.authService.register(createUserDto);

    return pendingUser;
  }

  @Post('login')
  async login(@Body() authDto: AuthDto): Promise<AuthToken> {
    const tokens = await this.authService.login(authDto);

    return tokens;
  }

  @Get('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@GetUser('sessionId') sessionId: string): Promise<void> {
    await this.authService.logout(sessionId);
  }

  @Get('verify-email/:id')
  async verifyEmail(
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<void> {
    const user = await this.authService.verifyEmail(id);

    res.sendStatus(200);

    // TODO: implement deep linking to redirect user back to login page
    // res.redirect('https://www.google.com');
  }

  @Post('refresh-token')
  @UseGuards(JwtRefreshGuard)
  async refreshToken(
    @GetUser('accessToken') accessToken: string,
  ): Promise<{ accessToken: string }> {
    return { accessToken };
  }

  @Post('forgot-password')
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<void> {
    const email = forgotPasswordDto.email;

    await this.authService.sendResetPasswordEmail(email);
  }

  @Put('reset-password')
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<void> {
    await this.authService.resetPassword(resetPasswordDto);
  }
}
