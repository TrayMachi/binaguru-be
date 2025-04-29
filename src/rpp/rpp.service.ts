import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRPPDto } from './rpp.dto';

@Injectable()
export class RPPService {
  constructor(private readonly prisma: PrismaService) {}

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

  async createRPP(userId: string, rppData: CreateRPPDto) {
    const newRPP = await this.prisma.rPP.create({
      data: {
        userId,
        title: rppData.title,
        description: rppData.description,
        contentMarkdown: rppData.contentMarkdown,
        level: rppData.level,
      },
    });

    return newRPP;
  }
}
