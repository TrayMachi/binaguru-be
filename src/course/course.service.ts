import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Level } from '../../generated/prisma';
import { CreateCourseDto } from './course.dto';

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
        language: true,
        courseType: true,
        courseSubject: true,
        user: {
          select: {
            cons: true,
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
        language: course.language,
        courseType: course.courseType,
        courseSubject: course.courseSubject,
        ownerCons: course.user.cons,
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
        language: true,
        courseType: true,
        courseSubject: true,
        user: {
          select: {
            cons: true,
          },
        },
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
        language: true,
        courseType: true,
        courseSubject: true,
        user: {
          select: {
            cons: true,
          },
        },
      },
    });

    return courses;
  }

  async getCourseById(courseId: string, userId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        title: true,
        description: true,
        level: true,
        Modules: {
          select: {
            id: true,
            title: true,
            Assignments: {
              select: {
                id: true,
                submission: {
                  where: {
                    userId: userId,
                  },
                  select: {
                    contentLink: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!course) {
      throw new Error('Course not found');
    }

    const modules = course.Modules.map((module) => {
      const assignment = module.Assignments;
      const hasAssignment = !!assignment;
      const submission = assignment?.submission[0];
      const submissionLink = submission?.contentLink;

      return {
        id: module.id,
        title: module.title,
        hasAssignment,
        ...(submissionLink && { submissionLink }),
      };
    });

    return {
      course: {
        id: course.id,
        title: course.title,
        description: course.description,
        level: course.level,
      },
      modules,
    };
  }

  async createCourse(userId: string, courseData: CreateCourseDto) {
    const newCourse = await this.prisma.course.create({
      data: {
        userId: userId,
        title: courseData.title,
        description: courseData.description,
        level: courseData.level,
        language: courseData.language,
        courseType: courseData.courseType,
        courseSubject: courseData.courseSubject,
        moduleCount: 0,
      },
      select: {
        id: true,
        title: true,
        description: true,
        level: true,
        language: true,
        courseType: true,
        courseSubject: true,
        moduleCount: true,
        createdAt: true,
      },
    });

    return newCourse;
  }
}
