import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { RPPService } from './rpp.service';
import { ResponseUtil } from '../common/utils/response.util';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { UserService } from '../user/user.service';
import { CreateRPPDto } from './rpp.dto';

@Controller('rpp')
@UseGuards(FirebaseAuthGuard)
export class RPPController {
  constructor(
    private readonly rppService: RPPService,
    private readonly responseUtil: ResponseUtil,
    private readonly userService: UserService,
  ) {}

  @Get()
  async getAllRPPs(@Req() req: Request) {
    //@ts-expect-error
    const user: { sub: string } = req.user;

    const rpps = await this.rppService.getAllRPPs(user.sub);

    return this.responseUtil.response(
      {
        code: 200,
        message: 'RPPs retrieved successfully',
      },
      {
        data: rpps,
      },
    );
  }

  @Get(':id')
  async getRPPById(@Param('id') id: string) {
    const rpp = await this.rppService.getRPPById(id);

    return this.responseUtil.response(
      {
        code: 200,
        message: 'RPP details retrieved successfully',
      },
      {
        data: rpp,
      },
    );
  }

  @Post()
  async createRPP(@Body() rppData: CreateRPPDto, @Req() req: Request) {
    //@ts-expect-error
    const user: { email: string } = req.user;

    const userData = await this.userService.getUserData(user.email);

    if (!userData) {
      return this.responseUtil.response(
        {
          code: 404,
          message: 'User not found',
        },
        null,
      );
    }

    const newRPP = await this.rppService.createRPP(userData, rppData);

    return this.responseUtil.response(
      {
        code: 201,
        message: 'RPP created successfully',
      },
      {
        data: {
          id: newRPP.id,
          title: newRPP.title,
          description: newRPP.description,
          level: newRPP.level,
          createdAt: newRPP.createdAt,
          contentMarkdown: newRPP.contentMarkdown,
        },
      },
    );
  }
}
