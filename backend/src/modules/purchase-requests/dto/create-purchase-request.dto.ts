import { IsString, IsNumber, IsOptional, IsArray, Min } from 'class-validator';

export class CreatePurchaseRequestDto {
  @IsString()
  make: string;

  @IsString()
  model: string;

  @IsNumber()
  year: number;

  @IsNumber()
  mileage: number;

  @IsString()
  @IsOptional()
  condition?: string;

  @IsNumber()
  @Min(0)
  expected_price: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  image_urls?: string[];

  @IsString()
  @IsOptional()
  engine_size?: string;

  @IsString()
  @IsOptional()
  transmission?: string;

  @IsString()
  @IsOptional()
  fuel_type?: string;

  @IsString()
  @IsOptional()
  exterior_color?: string;

  @IsString()
  @IsOptional()
  interior_color?: string;

  @IsString()
  @IsOptional()
  vin?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  client_name?: string;

  @IsString()
  @IsOptional()
  client_phone?: string;

  @IsString()
  @IsOptional()
  client_email?: string;
}
