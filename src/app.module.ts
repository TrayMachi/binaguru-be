import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ResponseUtil } from './common/utils/response.util';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { FirebaseModule } from './firebase/firebase.module';
import { AuthModule } from './auth/auth.module';
import { ZodValidationPipe } from 'nestjs-zod';
import { APP_PIPE } from '@nestjs/core';
import { UserModule } from './user/user.module';
import { CourseModule } from './course/course.module';
import { ModuleModule } from './modules/module.module';
import { SubmissionModule } from './submission/submission.module';
import { AssignmentModule } from './assignment/assignment.module';
import { RPPModule } from './rpp/rpp.module';
import { GeminiModule } from './gemini/gemini.module';

@Module({
  imports: [
    PrismaModule,
    ConfigModule.forRoot({ cache: true }),
    GeminiModule,
    FirebaseModule,
    AuthModule,
    UserModule,
    CourseModule,
    ModuleModule,
    SubmissionModule,
    AssignmentModule,
    RPPModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    ResponseUtil,
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
  ],
})
export class AppModule {}
