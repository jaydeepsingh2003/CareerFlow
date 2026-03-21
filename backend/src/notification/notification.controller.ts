import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Query,
} from "@nestjs/common";
import { NotificationService } from "./notification.service";
import { ApiTags, ApiOperation } from "@nestjs/swagger";

@ApiTags("Notifications")
@Controller("notifications")
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get("me")
  @ApiOperation({ summary: "Get current user notifications" })
  async getMy(@Query("userId") userId: string) {
    return this.notificationService.getForUser(userId);
  }

  @Get("unread-count")
  @ApiOperation({ summary: "Get unread notification count" })
  async getUnreadCount(@Query("userId") userId: string) {
    return { count: await this.notificationService.getUnreadCount(userId) };
  }

  @Patch(":id/read")
  @ApiOperation({ summary: "Mark a notification as read" })
  async markAsRead(@Param("id") id: string) {
    return this.notificationService.markAsRead(id);
  }

  @Post("read-all")
  @ApiOperation({ summary: "Mark all notifications as read" })
  async markAllAsRead(@Body() body: { userId: string }) {
    return this.notificationService.markAllAsRead(body.userId);
  }
}
