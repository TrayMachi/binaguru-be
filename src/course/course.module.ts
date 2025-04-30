import { Module } from '@nestjs/common';
import { CourseController } from './course.controller';
import { CourseService } from './course.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ResponseUtil } from '../common/utils/response.util';
import { UserModule } from '../user/user.module';
import { FirebaseAuthGuard } from 'src/auth/firebase-auth.guard';
import { FirebaseModule } from 'src/firebase/firebase.module';

@Module({
  imports: [PrismaModule, UserModule, FirebaseModule],
  controllers: [CourseController],
  providers: [CourseService, ResponseUtil, FirebaseAuthGuard],
  exports: [CourseService],
})
export class CourseModule {}
