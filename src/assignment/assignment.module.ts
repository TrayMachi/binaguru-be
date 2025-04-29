import { Module } from '@nestjs/common';
import { AssignmentController } from './assignment.controller';
import { AssignmentService } from './assignment.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ResponseUtil } from '../common/utils/response.util';
import { UserModule } from '../user/user.module';

@Module({
  imports: [PrismaModule, UserModule],
  controllers: [AssignmentController],
  providers: [AssignmentService, ResponseUtil],
  exports: [AssignmentService],
})
export class AssignmentModule {}
