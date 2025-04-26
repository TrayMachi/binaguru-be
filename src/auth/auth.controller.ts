import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { FirebaseAuthGuard } from './firebase-auth.guard';
import { ResponseUtil } from 'src/common/utils/response.util';
import { LoginDtoClass, RegisterDtoClass } from './auth.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly responseUtil: ResponseUtil,
  ) {}

  @Post('register')
  async register(
    @Body() body: RegisterDtoClass,
  ) {
    await this.authService.register(
        body,
    );

    return this.responseUtil.response({
      code: HttpStatus.OK,
      message: `User registered successfully`,
    });
  }

  @Post('login')
  async login(@Body() body: LoginDtoClass) {
    const loginResponse = await this.authService.login(
      body.email,
      body.password,
    );

    return this.responseUtil.response(
      {
        code: HttpStatus.OK,
        message: 'User logged in successfully',
      },
      {
        data: loginResponse,
      },
    );
  }

  @UseGuards(FirebaseAuthGuard)
  @Post('logout')
  async logout(@Req() req) {
    await this.authService.revokeRefreshTokens(req.user.sub);

    return this.responseUtil.response({
      code: HttpStatus.OK,
      message: `User logged out successfully`,
    });
  }
}
