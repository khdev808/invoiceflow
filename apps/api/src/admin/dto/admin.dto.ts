import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export const ADMIN_PLANS = ['free', 'pro', 'business'] as const;
export type AdminPlan = (typeof ADMIN_PLANS)[number];

export class UpdatePlanDto {
  @IsIn(ADMIN_PLANS)
  plan!: AdminPlan;
}

export class AdminUsersQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;
}
