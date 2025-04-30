import { Module } from '@nestjs/common';
import { SubmissionController } from './submission.controller';
import { SubmissionService } from './submission.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ResponseUtil } from '../common/utils/response.util';
import { UserModule } from '../user/user.module';
import { FirebaseAuthGuard } from 'src/auth/firebase-auth.guard';
import { FirebaseModule } from 'src/firebase/firebase.module';

@Module({
  imports: [PrismaModule, UserModule, FirebaseModule],
  controllers: [SubmissionController],
  providers: [SubmissionService, ResponseUtil, FirebaseAuthGuard],
  exports: [SubmissionService],
})
export class SubmissionModule {}
