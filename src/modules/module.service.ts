import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateModuleDto } from './module.dto';

@Injectable()
export class ModuleService {
  constructor(private readonly prisma: PrismaService) {}

  async getModuleById(moduleId: string, userId: string) {
    const module = await this.prisma.modules.findUnique({
      where: { id: moduleId },
      select: {
        id: true,
        title: true,
        courseId: true,
        contentMarkdown: true,
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
    });

    if (!module) {
      throw new NotFoundException('Module not found');
    }

    const assignment = module.Assignments;
    const assignmentId = assignment?.id || null;
    const submission = assignment?.submission?.[0];
    const submissionLink = submission?.contentLink || null;

    return {
      id: module.id,
      title: module.title,
      courseId: module.courseId,
      contentMarkdown: module.contentMarkdown,
      assignmentId,
      submissionLink,
    };
  }

  async createModule(userId: string, moduleData: CreateModuleDto) {
    const course = await this.prisma.course.findUnique({
      where: {
        id: moduleData.courseId,
      },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (course.userId !== userId) {
      throw new ForbiddenException('You do not own this course');
    }

    return await this.prisma.$transaction(async (tx) => {
      const newModule = await tx.modules.create({
        data: {
          title: moduleData.title,
          contentMarkdown: moduleData.contentMarkdown,
          courseId: moduleData.courseId,
        },
      });

      let assignment: any = null;
      if (moduleData.assignment) {
        assignment = await tx.assignment.create({
          data: {
            moduleId: newModule.id,
            title: moduleData.assignment.title,
            description: moduleData.assignment.description,
          },
        });
      }

      await tx.course.update({
        where: {
          id: moduleData.courseId,
        },
        data: {
          moduleCount: {
            increment: 1,
          },
        },
      });

      return {
        ...newModule,
        assignment,
      };
    });
  }
}
