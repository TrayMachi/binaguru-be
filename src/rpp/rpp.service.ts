import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRPPDto } from './rpp.dto';
import { User } from 'generated/prisma';
import { GeminiService } from 'src/gemini/gemini.service';

@Injectable()
export class RPPService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gemini: GeminiService,
  ) {}

  async getAllRPPs(userId: string) {
    const rpps = await this.prisma.rPP.findMany({
      where: {
        userId,
      },
      include: {
        user: {
          select: {
            username: true,
            email: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return rpps.map((rpp) => ({
      id: rpp.id,
      title: rpp.title,
      description: rpp.description,
      contentMarkdown: rpp.contentMarkdown,
      level: rpp.level,
      createdAt: rpp.createdAt,
      updatedAt: rpp.updatedAt,
      user: {
        username: rpp.user.username,
        email: rpp.user.email,
      },
    }));
  }

  async getRPPById(rppId: string) {
    const rpp = await this.prisma.rPP.findUnique({
      where: { id: rppId },
      include: {
        user: {
          select: {
            username: true,
            email: true,
          },
        },
      },
    });

    if (!rpp) {
      throw new NotFoundException('RPP not found');
    }

    return {
      id: rpp.id,
      title: rpp.title,
      description: rpp.description,
      contentMarkdown: rpp.contentMarkdown,
      level: rpp.level,
      createdAt: rpp.createdAt,
      updatedAt: rpp.updatedAt,
      user: {
        username: rpp.user.username,
        email: rpp.user.email,
      },
    };
  }

  async createRPP(user: User, rppData: CreateRPPDto) {
    const prompt = `
You are an expert in Indonesian education. Generate an RPP (Rencana Pelaksanaan Pembelajaran) document in **GitHub-flavored Markdown format** only.

## Requirements:
- The RPP must be in Indonesian language.
- The response must start immediately with valid Markdown.
- Do not include any explanations outside the Markdown block.
- Structure the RPP with proper Indonesian education headers (e.g., Tujuan Pembelajaran, Materi, Metode, Penilaian, etc.)

## Context:
- Title: ${rppData.title}
- Description: ${rppData.description}
- Teacher experience: ${user.yoe} years
- Teacher strengths: ${user.pros.join(', ')}
- Teacher weaknesses: ${user.cons.join(', ')}
- Teaching location: ${user.location}

Make the RPP suitable for a teacher with this background, teaching in the stated location.
`;

    const rppContent = await this.gemini.generateHtml(prompt);
    const newRPP = await this.prisma.rPP.create({
      data: {
        userId: user.id,
        title: rppData.title,
        description: rppData.description,
        contentMarkdown: rppContent.html,
        level: user.level,
      },
    });

    return newRPP;
  }
}
