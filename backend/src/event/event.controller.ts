import { Controller, Get, Query } from "@nestjs/common";
import { EventService } from "./event.service";
import { ApiTags, ApiOperation } from "@nestjs/swagger";

@ApiTags("Events")
@Controller("events")
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Get()
  @ApiOperation({ summary: "Get event logs for a user or system" })
  async getLogs(@Query("userId") userId?: string) {
    return this.eventService.getLogs(userId);
  }
}
