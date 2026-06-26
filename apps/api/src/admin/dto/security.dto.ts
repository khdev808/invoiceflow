import { IsOptional, IsString, IsIn, IsInt, Min, Max } from 'class-validator';

export class CreateSecurityBlockDto {
  @IsIn(['ip', 'email'])
  blockType: 'ip' | 'email';

  @IsString()
  value: string;

  @IsIn(['temporary', 'permanent'])
  scope: 'temporary' | 'permanent';

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(720)
  hours?: number;
}

export class BlockUserDto {
  @IsIn(['temporary', 'permanent'])
  scope: 'temporary' | 'permanent';

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(720)
  hours?: number;
}
