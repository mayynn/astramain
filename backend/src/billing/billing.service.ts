import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UtrStatus } from '@prisma/client';
import { DiscordBotService } from '../discord-bot/discord-bot.service';

@Injectable()
export class BillingService {
  constructor(
    private prisma: PrismaService,
    private discordBot: DiscordBotService,
  ) {}

  async getUpiDetails() {
    return {
      upiId: process.env.UPI_ID || '',
      upiName: process.env.UPI_NAME || '',
    };
  }

  async submitUtr(userId: number, amount: number, utrNumber: string, screenshotPath: string) {
    const submission = await this.prisma.utrSubmission.create({
      data: { userId, amount, utrNumber, screenshotPath, status: UtrStatus.pending },
      include: { user: { select: { email: true } } },
    });

    // Send Discord bot notification
    this.discordBot.sendUtrNotification(submission).catch(() => {});

    return submission;
  }

  async getUserSubmissions(userId: number) {
    return this.prisma.utrSubmission.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
