import { Module } from '@nestjs/common';
import { RPPController } from './rpp.controller';
import { RPPService } from './rpp.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ResponseUtil } from '../common/utils/response.util';
import { UserModule } from '../user/user.module';
import { FirebaseAuthGuard } from 'src/auth/firebase-auth.guard';
import { FirebaseModule } from 'src/firebase/firebase.module';

@Module({
  imports: [PrismaModule, UserModule, FirebaseModule],
  controllers: [RPPController],
  providers: [RPPService, ResponseUtil, FirebaseAuthGuard],
  exports: [RPPService],
})
export class RPPModule {}
