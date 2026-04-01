import { IsString, IsNumber, IsEnum, IsOptional, IsJSON, IsArray, IsInt, Min } from 'class-validator';
import { VehicleCategory, VehicleStatus } from '../../../common/enums';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVehicleDto {
  @ApiProperty()
  @IsString()
  make_ar: string;

  @ApiProperty()
  @IsString()
  make_en: string;

  @ApiProperty()
  @IsString()
  model_ar: string;

  @ApiProperty()
  @IsString()
  model_en: string;

  @ApiProperty()
  @IsInt()
  @Min(1900)
  year: number;

  @ApiProperty({ enum: VehicleCategory })
  @IsEnum(VehicleCategory)
  category: VehicleCategory;

  @ApiProperty({ enum: VehicleStatus, default: VehicleStatus.AVAILABLE })
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

  @ApiProperty({ type: [String], default: [] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  image_urls?: string[];
}
