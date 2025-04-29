import { Module } from '@nestjs/common';
import { RPPController } from './rpp.controller';
import { RPPService } from './rpp.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ResponseUtil } from '../common/utils/response.util';
import { UserModule } from '../user/user.module';

@Module({
  imports: [PrismaModule, UserModule],
  controllers: [RPPController],
  providers: [RPPService, ResponseUtil],
  exports: [RPPService],
})
export class RPPModule {}
