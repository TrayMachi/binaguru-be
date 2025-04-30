import { Module } from '@nestjs/common';
import { ResponseUtil } from 'src/common/utils/response.util';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { FirebaseModule } from 'src/firebase/firebase.module';
import { FirebaseAuthGuard } from 'src/auth/firebase-auth.guard';

@Module({
  imports: [FirebaseModule],
  controllers: [UserController],
  providers: [ResponseUtil, UserService, PrismaService, FirebaseAuthGuard],
  exports: [UserService],
})
export class UserModule {}
