import { Module } from '@nestjs/common';
import { ResponseUtil } from 'src/common/utils/response.util';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [UserController],
  providers: [ResponseUtil, UserService, PrismaService],
})
export class UserModule {}
