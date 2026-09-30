import { IsIn, IsOptional, IsBooleanString, IsNumberString, IsString } from 'class-validator';

export class FilterTaskDto {
  @IsBooleanString()
  @IsOptional()
  completed?: string;

  @IsIn(['low', 'medium', 'high'])
  @IsOptional()
  priority?: string;

  @IsString()
  @IsOptional()
  search?: string;

  @IsNumberString()
  @IsOptional()
  page?: string;

  @IsNumberString()
  @IsOptional()
  limit?: string;
}
