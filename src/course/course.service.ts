import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Level } from '../../generated/prisma';

@Injectable()
export class CourseService {
  constructor(private readonly prisma: PrismaService) {}

  async getGroupedCourses(userEmail: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: userEmail },
      include: {
        UserCourseProgress: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const userCourses = await this.getUserCourses(user.id);

    const recommendedCourses = await this.getRecommendedCourses(
      user.id,
      user.cons,
      user.pros,
      user.level,
    );

    const allCourses = await this.getAllCourses();

    return {
      courseku: userCourses,
      rekomendasi: recommendedCourses,
      allcourse: allCourses,
    };
  }

  private async getUserCourses(userId: string) {
    const courses = await this.prisma.course.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
        title: true,
        description: true,
        level: true,
        moduleCount: true,
        UserCourseProgress: {
          where: {
            userId,
          },
          select: {
            completedModules: true,
          },
        },
      },
    });

    return courses.map((course) => {
      const progress = course.UserCourseProgress[0];
      const completedModules = progress?.completedModules || 0;
      const totalModules = course.moduleCount || 1;
      const progressPercentage = Math.floor(
        (completedModules / totalModules) * 100,
      );

      return {
        id: course.id,
        title: course.title,
        description: course.description,
        level: course.level,
        progress: progressPercentage,
      };
    });
  }

  private async getRecommendedCourses(
    userId: string,
    userCons: string[],
    userPros: string[],
    userLevel: Level,
  ) {
    const recommendedCourses = await this.prisma.course.findMany({
      where: {
        NOT: {
          userId,
        },
        level: userLevel,
        courseType: {
          in: userPros,
        },
        user: {
          cons: {
            hasSome: userCons,
          },
        },
      },
      select: {
        id: true,
        title: true,
        description: true,
        level: true,
      },
      take: 3,
    });

    return recommendedCourses;
  }

  private async getAllCourses() {
    const courses = await this.prisma.course.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        level: true,
      },
    });

    return courses;
  }
}
