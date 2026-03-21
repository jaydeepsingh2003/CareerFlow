import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../common/prisma/prisma.service";
import { QdrantService } from "../ai/qdrant.service";
import * as crypto from "crypto";

@Injectable()
export class DeduplicationService {
  private readonly logger = new Logger(DeduplicationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly qdrant: QdrantService,
  ) {}

  generateHash(title: string, company: string, location: string): string {
    const normalized = `${title.toLowerCase().trim()}|${company.toLowerCase().trim()}|${location?.toLowerCase().trim()}`;
    return crypto.createHash("sha256").update(normalized).digest("hex");
  }

  async findDuplicate(
    externalId: string,
    jobHash: string,
    vector?: number[],
  ): Promise<any> {
    // 1. External ID check (Highest confidence)
    if (externalId) {
      const exists = await this.prisma.jobPosting.findFirst({
        where: { externalId },
      });
      if (exists) return exists;
    }

    // 2. Hash-based check
    const existsByHash = await this.prisma.jobPosting.findFirst({
      where: { jobHash },
    });
    if (existsByHash) return existsByHash;

    // 3. Embedding Similarity check (Threshold: 0.92)
    if (vector) {
      const similar = await this.qdrant.searchSimilar(vector, 1);
      if (similar.length > 0 && similar[0].score > 0.92) {
        this.logger.log(
          `Duplicate detected by embedding (score: ${similar[0].score})`,
        );
        const jobId = (similar[0].payload as any)?.jobId;
        if (jobId) {
          return this.prisma.jobPosting.findUnique({ where: { id: jobId } });
        }
      }
    }

    return null;
  }
}
