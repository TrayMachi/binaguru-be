import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubmissionDto } from './submission.dto';
import { GeminiService } from 'src/gemini/gemini.service';

@Injectable()
export class SubmissionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gemini: GeminiService,
  ) {}

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

    const prompt = `
    You are an expert evaluator for teacher assignments. Analyze the first minute of the YouTube video at this link: ${submissionData.contentLink}.
    
    ## Instructions:
    - Watch and analyze only the **first minute** of the video.
    - Soal yang diberikan adalah: ${assignment.description}
    - Evaluate the teacher's explanation, clarity, engagement, and teaching technique.
    - Provide constructive feedback and suggestions for improvement.
    - Respond in **GitHub-flavored Markdown** only.
    - Do **not** include any HTML or extra explanation outside the Markdown.
    - Start immediately with Markdown.
    
    ## Example Output:
    # Evaluasi Video (1 Menit Pertama)
    
    - **Kejelasan Penjelasan:** Jelas dan mudah dipahami (80%).
    - **Teknik Mengajar:** Menggunakan contoh yang relevan.
    - **Interaksi:** Cukup interaktif dengan audiens (98%).
    - **Saran:** Tambahkan visual atau ilustrasi untuk memperkuat materi.
    - **Rating:** 8/10
    - **Kesimpulan:** Secara keseluruhan, video ini sangat baik untuk pemula.
    
    Buat evaluasi yang sesuai dengan video pada link di atas yang lebih lengkap dibandingkan dengan contoh di atas. Harus menghasilkan analisa mengenai jawaban dari video tersebut dan membuat kritik yang membangun kepada guru tersebut.
    `;

    const evaluation = await this.gemini.generateHtml(prompt);

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

  async getSubmissionById(id: string, userId: string) {
    const submission = await this.prisma.submission.findUnique({
      where: { id },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    if (submission.userId !== userId) {
      throw new NotFoundException('Submission not found');
    }

    return submission;
  }
}
