import { IsIn, IsOptional, IsBooleanString } from 'class-validator';

export class FilterTaskDto {
  @IsBooleanString()
  @IsOptional()
  completed?: string;

  @IsIn(['low', 'medium', 'high'])
  @IsOptional()
  priority?: string;
}
