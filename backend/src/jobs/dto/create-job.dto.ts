import { IsString, IsNotEmpty, IsOptional, IsArray } from "class-validator";

export class CreateJobDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  company: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsString()
  source?: string; // KODNEST, LINKEDIN, NAUKRI

  @IsOptional()
  @IsString()
  applyUrl?: string;
}

export class ImportJobDto {
  @IsString()
  @IsNotEmpty()
  url: string;
}
