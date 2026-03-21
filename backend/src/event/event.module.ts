import { Module, Global } from "@nestjs/common";
import { EventService } from "./event.service";
import { EventController } from "./event.controller";
import { PrismaModule } from "../common/prisma/prisma.module";

@Global()
@Module({
  imports: [PrismaModule],
  providers: [EventService],
  controllers: [EventController],
  exports: [EventService],
})
export class EventModule {}
