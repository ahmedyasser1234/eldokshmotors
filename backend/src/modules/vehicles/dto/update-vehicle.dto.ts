import { IsString, IsNumber, IsEnum, IsOptional, IsArray, IsInt, Min } from 'class-validator';
import { VehicleCategory, VehicleStatus } from '../../../common/enums';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateVehicleDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  make_ar?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  make_en?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  model_ar?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  model_en?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(1900)
  year?: number;

  @ApiProperty({ enum: VehicleCategory, required: false })
  @IsOptional()
  @IsEnum(VehicleCategory)
  category?: VehicleCategory;

  @ApiProperty({ enum: VehicleStatus, required: false })
  @IsOptional()
  @IsEnum(VehicleStatus)
  status?: VehicleStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  rent_price_per_day?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  sale_price?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description_ar?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description_en?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  details?: any;

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  image_urls?: string[];
}
