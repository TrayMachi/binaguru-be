import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { EditProfileDto } from './user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserData(email: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: email,
      },
      include: {
        Courses: true,
        RPP: true,
        UserCourseProgress: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async editUserData(email: string, data: EditProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        ...(data.username && { username: data.username }),
        ...(data.yoe !== undefined && { yoe: data.yoe }),
        ...(data.pros && { pros: data.pros }),
        ...(data.cons && { cons: data.cons }),
        ...(data.location && { location: data.location }),
        ...(data.birthDate && { birthDate: new Date(data.birthDate) }),
        ...(data.level && { level: data.level }),
      },
    });
  }
}
