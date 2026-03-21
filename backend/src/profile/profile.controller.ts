import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
} from "@nestjs/common";
import { ProfileService } from "./profile.service";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";

@ApiTags("profile")
@Controller("profile")
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get("me")
  @ApiOperation({ summary: "Get current user profile" })
  async getProfile(@Query("userId") userId: string) {
    return this.profileService.findByUserId(userId);
  }

  @Post("update")
  @ApiOperation({ summary: "Update current user profile" })
  async updateProfile(@Body() body: any) {
    return this.profileService.update(body.userId, body);
  }
}
