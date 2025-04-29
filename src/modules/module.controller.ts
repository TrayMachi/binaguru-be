import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ModuleService } from './module.service';
import { ResponseUtil } from '../common/utils/response.util';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { UserService } from '../user/user.service';
import { CreateModuleDto } from './module.dto';

@Controller('modules')
@UseGuards(FirebaseAuthGuard)
export class ModuleController {
  constructor(
    private readonly moduleService: ModuleService,
    private readonly responseUtil: ResponseUtil,
    private readonly userService: UserService,
  ) {}

  @Get(':id')
  async getModuleById(@Param('id') id: string, @Req() req: Request) {
    //@ts-expect-error
    const user: { email: string } = req.user;

    const userData = await this.userService.getUserData(user.email);
    const moduleDetail = await this.moduleService.getModuleById(
      id,
      userData.id,
    );

    return this.responseUtil.response(
      {
        code: 200,
        message: 'Module details retrieved successfully',
      },
      moduleDetail,
    );
  }

  @Post()
  async createModule(@Body() moduleData: CreateModuleDto, @Req() req: Request) {
    //@ts-expect-error
    const user: { email: string } = req.user;

    const userData = await this.userService.getUserData(user.email);
    const newModule = await this.moduleService.createModule(
      userData.id,
      moduleData,
    );

    return this.responseUtil.response(
      {
        code: 201,
        message: moduleData.assignment
          ? 'Module with assignment created successfully'
          : 'Module created successfully',
      },
      {
        id: newModule.id,
        title: newModule.title,
        courseId: newModule.courseId,
        contentMarkdown: newModule.contentMarkdown,
        assignment: newModule.assignment
          ? {
              id: (newModule.assignment as any).id,
              title: (newModule.assignment as any).title,
            }
          : null,
      },
    );
  }
}
