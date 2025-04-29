import { Module } from '@nestjs/common';
import { SubmissionController } from './submission.controller';
import { SubmissionService } from './submission.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ResponseUtil } from '../common/utils/response.util';
import { UserModule } from '../user/user.module';

@Module({
  imports: [PrismaModule, UserModule],
  controllers: [SubmissionController],
  providers: [SubmissionService, ResponseUtil],
  exports: [SubmissionService],
})
export class SubmissionModule {}
