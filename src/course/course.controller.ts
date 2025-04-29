import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { CourseService } from './course.service';
import { ResponseUtil } from '../common/utils/response.util';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { UserService } from '../user/user.service';

@Controller('courses')
@UseGuards(FirebaseAuthGuard)
export class CourseController {
  constructor(
    private readonly courseService: CourseService,
    private readonly responseUtil: ResponseUtil,
    private readonly userService: UserService,
  ) {}

  @Get()
  async getGroupedCourses(@Req() req: Request) {
    //@ts-expect-error
    const user: { email: string } = req.user;

    const groupedCourses = await this.courseService.getGroupedCourses(
      user.email,
    );

    return this.responseUtil.response(
      {
        code: 200,
        message: 'Courses retrieved successfully',
      },
      groupedCourses,
    );
  }

  @Get(':id')
  async getCourseById(@Param('id') id: string, @Req() req: Request) {
    //@ts-expect-error
    const user: { email: string } = req.user;

    const userData = await this.userService.getUserData(user.email);
    const courseDetail = await this.courseService.getCourseById(
      id,
      userData.id,
    );

    return this.responseUtil.response(
      {
        code: 200,
        message: 'Course details retrieved successfully',
      },
      courseDetail,
    );
  }
}
