import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubmissionDto } from './submission.dto';

@Injectable()
export class SubmissionService {
  constructor(private readonly prisma: PrismaService) {}

  async submitAssignment(userId: string, submissionData: CreateSubmissionDto) {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id: submissionData.assignmentId },
      include: {
        module: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    const existingSubmission = await this.prisma.submission.findUnique({
      where: {
        assignmentId_userId: {
          assignmentId: submissionData.assignmentId,
          userId: userId,
        },
      },
    });

    let submission;

    if (existingSubmission) {
      submission = await this.prisma.submission.update({
        where: {
          id: existingSubmission.id,
        },
        data: {
          contentLink: submissionData.contentLink,
          attempts: { increment: 1 },
          updatedAt: new Date(),
        },
      });
    } else {
      submission = await this.prisma.submission.create({
        data: {
          assignmentId: submissionData.assignmentId,
          userId: userId,
          contentLink: submissionData.contentLink,
          attempts: 1,
        },
      });

      await this.updateUserCourseProgress(userId, assignment.module.courseId);
    }

    return submission;
  }

  private async updateUserCourseProgress(userId: string, courseId: string) {
    const userCourseProgress = await this.prisma.userCourseProgress.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (userCourseProgress) {
      await this.prisma.userCourseProgress.update({
        where: {
          id: userCourseProgress.id,
        },
        data: {
          completedModules: { increment: 1 },
          updatedAt: new Date(),
        },
      });
    } else {
      await this.prisma.userCourseProgress.create({
        data: {
          userId,
          courseId,
          completedModules: 1,
        },
      });
    }
  }
}
