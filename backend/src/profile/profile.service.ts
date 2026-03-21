import { Injectable } from "@nestjs/common";
import { PrismaService } from "../common/prisma/prisma.service";

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string) {
    return this.prisma.profile.findUnique({
      where: { userId },
      include: { skills: { include: { skill: true } } },
    });
  }

  async update(userId: string, data: any) {
    const { skills, ...profileData } = data;

    // If socialLinks is an object, stringify it for SQLite
    if (
      profileData.socialLinks &&
      typeof profileData.socialLinks !== "string"
    ) {
      profileData.socialLinks = JSON.stringify(profileData.socialLinks);
    }

    const profile = await this.prisma.profile.update({
      where: { userId },
      data: profileData,
    });

    if (skills && Array.isArray(skills)) {
      // Skill sync logic (Simplified for MVP)
      // 1. Clear existing skills
      await this.prisma.userSkill.deleteMany({
        where: { profileId: profile.id },
      });

      // 2. Add new skills
      for (const skillName of skills) {
        // Find or create skill
        const skill = await this.prisma.skill.upsert({
          where: { normalizedName: skillName.toLowerCase() },
          update: {},
          create: { name: skillName, normalizedName: skillName.toLowerCase() },
        });

        await this.prisma.userSkill.create({
          data: {
            profileId: profile.id,
            skillId: skill.id,
            level: 3, // Default level
          },
        });
      }
    }

    return this.findByUserId(userId);
  }
}
