import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Level } from '../../generated/prisma';
import { CreateCourseDto } from './course.dto';
import { GeminiService } from 'src/gemini/gemini.service';

@Injectable()
export class CourseService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gemini: GeminiService,
  ) {}

  async getGroupedCourses(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
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
    let potentialMatches = await this.prisma.course.findMany({
      where: {
        NOT: {
          userId,
        },
        OR: [
          { level: userLevel },
          { courseType: { in: userPros } },
          {
            user: {
              cons: {
                hasSome: userCons,
              },
            },
          },
        ],
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
    });

    if (potentialMatches.length === 0) {
      potentialMatches = await this.prisma.course.findMany({
        where: {
          NOT: {
            userId,
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
        orderBy: {
          createdAt: 'desc',
        },
      });

      return potentialMatches;
    }

    const scoredCourses = potentialMatches.map((course) => {
      let score = 0;

      if (course.level === userLevel) score += 1;
      if (userPros.includes(course.courseType)) score += 1;

      const creatorCons = course.user.cons;
      if (creatorCons.some((con) => userCons.includes(con))) score += 1;

      return { ...course, matchScore: score };
    });

    const recommendedCourses = scoredCourses
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 3)
      .map(({ matchScore, ...course }) => course);

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
        language: true,
        courseType: true,
        courseSubject: true,
        moduleCount: true,
        UserCourseProgress: {
          where: {
            userId,
          },
          select: {
            completedModules: true,
          },
        },
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
        assignmentId: assignment?.id,
        hasAssignment,
        ...(submissionLink && { submissionLink }),
      };
    });

    const progress = course.UserCourseProgress[0];
    const completedModules = progress?.completedModules || 0;
    const totalModules = course.moduleCount || 1;
    const progressPercentage = Math.floor(
      (completedModules / totalModules) * 100,
    );

    return {
      course: {
        id: course.id,
        title: course.title,
        description: course.description,
        level: course.level,
        language: course.language,
        courseType: course.courseType,
        courseSubject: course.courseSubject,
        progress: progressPercentage,
      },
      modules,
    };
  }

  async createCourse(userId: string, courseData: CreateCourseDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        yoe: true,
        pros: true,
        cons: true,
        location: true,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const prompt = `
You are an expert course creator for Indonesian educators. Generate a **course** in **GitHub-flavored Markdown** only.

## Format & Structure:
- Start with the course title as a level 1 heading (\`# Judul Kursus\`).
- Immediately after the title, write a short paragraph as the course description (no heading).
- For each module:
  - Start the module with a level 2 heading (\`## Judul Modul\`).
  - **After the module title, write a substantial, clear, and engaging explanation or lesson content in Markdown (paragraphs, lists, tables, emojis, etc.). This content must help the reader gain knowledge and should not be empty.**
  - At the end of each module, add an assignment starting with \`Tugas:\` or \`**Tugas:**\` on a new line, then the assignment instructions (can be multiline).

## Example:
# Nama Kursus
Deskripsi kursus di sini.

## Modul 1: Judul Modul
Penjelasan materi modul ini. Bisa berupa paragraf, poin-poin, tabel, atau contoh kode. Materi harus jelas dan bermanfaat.

**Tugas:** Jelaskan kembali materi ini dengan contoh.

## Modul 2: Judul Modul
Materi modul kedua di sini. Tambahkan tips, ilustrasi, atau studi kasus jika perlu.

Tugas: Buat ringkasan dari modul ini.

## Requirements:
- All content must be in Indonesian.
- No HTML, no extra explanation, only Markdown.
- Use engaging, clear, and motivating language.
- **Each module must have meaningful content before the assignment.**
- Start immediately with Markdown, no extra text.

## Context:
- Judul kursus: ${courseData.title}
- Deskripsi kursus: ${courseData.description}
- Jenjang: ${courseData.level}
- Bahasa: ${courseData.language}
- Tipe kursus: ${courseData.courseType}
- Subjek kursus: ${courseData.courseSubject}
- Pengalaman guru: ${user.yoe} tahun
- Keminatan guru: ${user.pros.join(', ')}
- Kelemahan guru: ${user.cons.join(', ')}
- Lokasi mengajar: ${user.location}

Buat kursus yang sesuai dengan konteks di atas.
`;

    // 1. Generate markdown from Gemini (replace with your GeminiService)
    const markdown = await this.gemini.generateText(prompt);

    // 2. Parse markdown to extract course, modules, assignments
    const parsed = await this.parseCourseMarkdown(markdown);

    // 3. Save course
    const newCourse = await this.prisma.course.create({
      data: {
        userId,
        title: parsed.title,
        description: parsed.description,
        level: courseData.level,
        language: courseData.language,
        courseType: courseData.courseType,
        courseSubject: courseData.courseSubject,
        moduleCount: parsed.modules.length,
      },
    });

    // 4. Save modules and assignments
    for (const mod of parsed.modules) {
      const prompt = `
You are an expert in Indonesian education. Generate a **course module** in **GitHub-flavored Markdown** only.

## Requirements:
-  The module must be in ${courseData.language} language.
-  Don't use any HTML tags.
-  The content must be based on the title (${mod.title}) and description provided (${parsed.description}).
-  The description is from the course context and not module context.
-  Use emojis to enhance the content.
-  The response must start immediately with valid Markdown.
-  Do not include any explanations outside the Markdown block.
-  Write a substantial, clear, and engaging explanation or lesson content in Markdown (paragraphs, lists, tables, emojis, etc.). This content must help the reader gain knowledge and should not be empty.

## Context:
- Judul Module: ${mod.title}
- Deskripsi kursus: ${parsed.description}
- Jenjang: ${courseData.level}
- Bahasa: ${courseData.language}
- Tipe kursus: ${courseData.courseType}
- Subjek kursus: ${courseData.courseSubject}
- Pengalaman guru: ${user.yoe} tahun
- Keminatan guru: ${user.pros.join(', ')}
- Kelemahan guru: ${user.cons.join(', ')}
- Lokasi mengajar: ${user.location}

Buat modul yang sesuai dengan konteks di atas untuk pembelajaran kepada guru, agar guru di indonesia berkembang.
`;

      const moduleContent = await this.gemini.generateText(prompt);

      // Save module with generated content

      const newModule = await this.prisma.modules.create({
        data: {
          courseId: newCourse.id,
          title: mod.title,
          contentMarkdown: moduleContent,
        },
      });
      if (mod.assignment) {
        await this.prisma.assignment.create({
          data: {
            moduleId: newModule.id,
            title: mod.assignment.title,
            description: mod.assignment.description,
          },
        });
      }
    }

    return { ...newCourse };
  }

  async parseCourseMarkdown(markdown: string) {
    const lines = markdown.split('\n');
    let title = '';
    let description = '';
    const modules: any[] = [];
    let currentModule: any = null;
    let inAssignment = false;
    let buffer: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Course title (assume first H1)
      if (!title && line.startsWith('# ')) {
        title = line.replace(/^# /, '').trim();
        continue;
      }

      // Course description (assume first paragraph after title)
      if (!description && line && !line.startsWith('#')) {
        description = line;
        continue;
      }

      // Module title (assume H2)
      if (line.startsWith('## ')) {
        if (currentModule) {
          // Save only non-empty content, or a default message
          const content = buffer.join('\n').trim();
          currentModule.content = content || 'Materi modul belum diisi.';
          modules.push(currentModule);
        }
        currentModule = {
          title: line.replace(/^## /, '').trim(),
          content: '',
          assignment: null,
        };
        buffer = [];
        inAssignment = false;
        continue;
      }

      // Assignment (assume starts with "Tugas:" or "**Tugas:**")
      if (line.match(/^(\*\*)?Tugas:/i)) {
        if (currentModule && !currentModule.assignment) {
          // Save only non-empty content, or a default message
          const content = buffer.join('\n').trim();
          currentModule.content = content || 'Materi modul belum diisi.';
          buffer = [];
          inAssignment = true;
          // Assignment title and description
          const assignmentLine = line.replace(/^\*\*?Tugas:\*\*?/i, '').trim();
          currentModule.assignment = {
            title: 'Tugas',
            description: assignmentLine || '',
          };
          continue;
        }
      }

      // Assignment content (after "Tugas:")
      if (inAssignment && currentModule && currentModule.assignment) {
        currentModule.assignment.description += '\n' + line;
        continue;
      }

      // Module content (only if not in assignment)
      if (currentModule && !inAssignment) {
        buffer.push(line);
      }
    }

    // Push last module
    if (currentModule) {
      const content = buffer.join('\n').trim();
      currentModule.content = content || 'Materi modul belum diisi.';
      modules.push(currentModule);
    }

    return { title, description, modules };
  }
}
