import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AssignmentService {
  constructor(private readonly prisma: PrismaService) {}

  async getAssignmentById(assignmentId: string, userId: string) {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id: assignmentId },
      select: {
        id: true,
        moduleId: true,
        title: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        module: {
          select: {
            id: true,
            title: true,
            courseId: true,
          },
        },
        submission: {
          where: {
            userId: userId,
          },
          select: {
            id: true,
            contentLink: true,
            attempts: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    // Format the response to match our DTO
    return {
      id: assignment.id,
      moduleId: assignment.moduleId,
      title: assignment.title,
      description: assignment.description,
      createdAt: assignment.createdAt,
      updatedAt: assignment.updatedAt,
      module: assignment.module,
      // Return the user's submission or null if none exists
      userSubmission: assignment.submission[0] || null,
    };
  }
}
