import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { FirebaseModule } from '../firebase/firebase.module';
import { FirebaseAuthGuard } from './firebase-auth.guard';
import { ConfigModule } from '@nestjs/config';
import { ResponseUtil } from 'src/common/utils/response.util';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [FirebaseModule, ConfigModule, PrismaModule],
  controllers: [AuthController],
  providers: [AuthService, FirebaseAuthGuard, ResponseUtil],
  exports: [AuthService],
})
export class AuthModule {}
