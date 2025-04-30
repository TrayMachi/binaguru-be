import { Module } from '@nestjs/common';
import { AssignmentController } from './assignment.controller';
import { AssignmentService } from './assignment.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ResponseUtil } from '../common/utils/response.util';
import { UserModule } from '../user/user.module';
import { FirebaseModule } from 'src/firebase/firebase.module';
import { FirebaseAuthGuard } from 'src/auth/firebase-auth.guard';

@Module({
  imports: [PrismaModule, UserModule, FirebaseModule],
  controllers: [AssignmentController],
  providers: [AssignmentService, ResponseUtil, FirebaseAuthGuard],
  exports: [AssignmentService],
})
export class AssignmentModule {}
