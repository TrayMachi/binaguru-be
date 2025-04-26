import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthFirebaseService } from 'src/firebase/firebase.service';
import { RegisterDtoClass } from './auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly authFirebaseService: AuthFirebaseService,
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {}

  async register(registerDto: RegisterDtoClass) {
    try {
      registerDto.email;
      const userRecord = await this.authFirebaseService.createUser({
        email: registerDto.email,
        password: registerDto.password,
        displayName: registerDto.username,
      });

      if (!userRecord) {
        throw new BadRequestException('User registration failed');
      }

      const user = await this.prismaService.user.findUnique({
        where: { email: registerDto.email },
      });

      if (!user) {
        await this.prismaService.user.create({
          data: {
            id: userRecord.uid,
            email: registerDto.email,
            username: registerDto.username,
            yoe: registerDto.yoe,
            pros: registerDto.pros,
            cons: registerDto.cons,
            location: registerDto.location,
          },
        });
      }

      return {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async login(email: string, password: string) {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${this.configService.get<string>('API_KEY')}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, returnSecureToken: true }),
      },
    );

    const data = await res.json();

    if (!res.ok) {
      throw new UnauthorizedException(
        data.error?.message || 'Invalid credentials',
      );
    }

    return {
      idToken: data.idToken,
      refreshToken: data.refreshToken,
      expiresIn: data.expiresIn,
    };
  }

  async revokeRefreshTokens(uid: string) {
    try {
      await this.authFirebaseService.revokeRefreshTokens(uid);
      return { message: 'Refresh tokens revoked for user', uid };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async verifyIdToken(idToken: string) {
    try {
      return await this.authFirebaseService.verifyIdToken(idToken);
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
