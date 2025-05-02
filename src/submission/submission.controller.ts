import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SubmissionService } from './submission.service';
import { ResponseUtil } from '../common/utils/response.util';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { CreateSubmissionDto } from './submission.dto';
import { UserService } from '../user/user.service';

@Controller('submissions')
@UseGuards(FirebaseAuthGuard)
export class SubmissionController {
  constructor(
    private readonly submissionService: SubmissionService,
    private readonly responseUtil: ResponseUtil,
    private readonly userService: UserService,
  ) {}

  @Post()
  async submitAssignment(
    @Body() submissionData: CreateSubmissionDto,
    @Req() req: Request,
  ) {
    //@ts-expect-error
    const user: { email: string } = req.user;

    const userData = await this.userService.getUserData(user.email);
    const submission = await this.submissionService.submitAssignment(
      userData.id,
      submissionData,
    );

    return this.responseUtil.response({
      code: 201,
      message:
        submission.attempts > 1
          ? 'Submission updated successfully'
          : 'Submission created successfully',
    });
  }

  @Get(':id')
  async getSubmissionById(@Req() req: Request, @Param('id') id: string) {
    //@ts-expect-error
    const user: { email: string } = req.user;

    const userData = await this.userService.getUserData(user.email);
    const submissionDetail = await this.submissionService.getSubmissionById(
      id,
      userData.id,
    );

    return this.responseUtil.response(
      {
        code: 200,
        message: 'Submission details retrieved successfully',
      },
      { data: { ...submissionDetail } },
    );
  }
}
