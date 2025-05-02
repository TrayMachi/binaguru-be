import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { AssignmentService } from './assignment.service';
import { ResponseUtil } from '../common/utils/response.util';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { UserService } from '../user/user.service';

@Controller('assignments')
@UseGuards(FirebaseAuthGuard)
export class AssignmentController {
  constructor(
    private readonly assignmentService: AssignmentService,
    private readonly responseUtil: ResponseUtil,
    private readonly userService: UserService,
  ) {}

  @Get(':id')
  async getAssignmentById(@Param('id') id: string, @Req() req: Request) {
    //@ts-expect-error
    const user: { email: string } = req.user;

    const userData = await this.userService.getUserData(user.email);
    const assignmentDetail = await this.assignmentService.getAssignmentById(
      id,
      userData.id,
    );

    return this.responseUtil.response(
      {
        code: 200,
        message: 'Assignment details retrieved successfully',
      },
      { data: { ...assignmentDetail } },
    );
  }
}
