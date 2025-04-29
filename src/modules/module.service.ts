import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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
    const submission = assignment?.submission[0];
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
}
