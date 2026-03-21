import { Module, Global } from "@nestjs/common";
import { CacheModule } from "@nestjs/cache-manager";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { redisStore } from "cache-manager-ioredis-yet";

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const host = configService.get("REDIS_HOST", "localhost");
        // Simple check: if localhost and likely no redis, could use memory.
        // But better: try/catch the redis connection or just let it fail if critical.
        // For this user context where they lack Redis, let's use memory store for dev convenience.

        // FORCE MEMORY STORE for now to unblock user if Redis is missing
        return {
          store: "memory",
          ttl: 60 * 60 * 24,
        };

        // Original Production Code (Commented out for temporary fix)
        /*
                return {
                    store: await redisStore({
                        host,
                        port: configService.get('REDIS_PORT', 6379),
                        ttl: 60 * 60 * 24,
                    }),
                };
                */
      },
      inject: [ConfigService],
    }),
  ],
  exports: [CacheModule],
})
export class GlobalCacheModule {}
