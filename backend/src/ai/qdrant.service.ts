import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { QdrantClient } from "@qdrant/js-client-rest";

@Injectable()
export class QdrantService implements OnModuleInit {
  private readonly logger = new Logger(QdrantService.name);
  private client: QdrantClient;
  private readonly collectionName = "job_postings";

  constructor(private configService: ConfigService) {
    const url = this.configService.get<string>(
      "QDRANT_URL",
      "http://localhost:6333",
    );
    this.client = new QdrantClient({ url });
  }

  async onModuleInit() {
    await this.ensureCollection();
  }

  private async ensureCollection() {
    try {
      const collections = await this.client.getCollections();
      const exists = collections.collections.find(
        (c) => c.name === this.collectionName,
      );

      if (!exists) {
        this.logger.log(`Creating Qdrant collection: ${this.collectionName}`);
        await this.client.createCollection(this.collectionName, {
          vectors: {
            size: 1024, // Matches mxbai-embed-large
            distance: "Cosine",
          },
        });
      }
    } catch (error) {
      this.logger.error(`Qdrant initialization failed: ${error.message}`);
    }
  }

  async upsertJob(id: string, vector: number[], payload: any) {
    try {
      await this.client.upsert(this.collectionName, {
        wait: true,
        points: [{ id, vector, payload }],
      });
    } catch (error) {
      this.logger.error(`Failed to upsert to Qdrant: ${error.message}`);
    }
  }

  async searchSimilar(vector: number[], limit = 3) {
    try {
      return await this.client.search(this.collectionName, {
        vector,
        limit,
        with_payload: true,
      });
    } catch (error) {
      this.logger.error(`Qdrant search failed: ${error.message}`);
      return [];
    }
  }
}
