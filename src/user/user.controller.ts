import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { ResponseUtil } from 'src/common/utils/response.util';
import { EditProfileDto } from './user.dto';
import { UserService } from './user.service';
import { FirebaseAuthGuard } from 'src/auth/firebase-auth.guard';

@Controller('user')
@UseGuards(FirebaseAuthGuard)
export class UserController {
  constructor(
    private readonly responseUtil: ResponseUtil,
    private readonly userService: UserService,
  ) {}

  @Get()
  async getUserData(@Req() req: Request) {
    //@ts-expect-error
    const user: { email: string } = req.user;

    const userData = await this.userService.getUserData(user.email);

    return this.responseUtil.response(
      {
        code: 200,
        message: 'User data retrieved successfully',
      },
      {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        yoe: userData.yoe,
        pros: userData.pros,
        cons: userData.cons,
        location: userData.location,
        birthDate: userData.birthDate,
        level: userData.level,
        courses: userData.Courses,
        rpps: userData.RPP,
        progress: userData.UserCourseProgress,
      },
    );
  }

  @Patch('edit-profile')
  async editProfile(@Req() req: Request, @Body() body: EditProfileDto) {
    //@ts-expect-error
    const user: { email: string } = req.user;

    const updatedUser = await this.userService.editUserData(user.email, body);

    return this.responseUtil.response(
      {
        code: 200,
        message: 'Profile updated successfully',
      },
      {
        id: updatedUser.id,
      },
    );
  }
}
