import { Module } from '@nestjs/common';
import { ModuleController } from './module.controller';
import { ModuleService } from './module.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ResponseUtil } from '../common/utils/response.util';
import { UserModule } from '../user/user.module';
import { FirebaseModule } from 'src/firebase/firebase.module';
import { FirebaseAuthGuard } from 'src/auth/firebase-auth.guard';

@Module({
  imports: [PrismaModule, UserModule, FirebaseModule],
  controllers: [ModuleController],
  providers: [ModuleService, ResponseUtil, FirebaseAuthGuard],
  exports: [ModuleService],
})
export class ModuleModule {}
