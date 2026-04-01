import { IsNumber, IsOptional, IsString, IsBoolean, IsObject, IsEnum, Min } from 'class-validator';
import { VehicleCategory } from '../../../common/enums';

export class InstallmentInfoDto {
  @IsNumber()
  down_payment: number;

  @IsNumber()
  months: number;

  @IsNumber()
  monthly_payment: number;

  @IsNumber()
  @IsOptional()
  interest_rate?: number;

  @IsNumber()
  @IsOptional()
  total_amount?: number;
}

export class ConfirmPurchaseDto {
  @IsNumber()
  @Min(0)
  sale_price: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  reservation_price?: number;

  @IsBoolean()
  @IsOptional()
  has_installments?: boolean;

  @IsObject()
  @IsOptional()
  installment_info?: InstallmentInfoDto;

  // Editable vehicle data from the original request
  @IsString()
  make_ar: string;

  @IsString()
  make_en: string;

  @IsString()
  model_ar: string;

  @IsString()
  model_en: string;

  @IsEnum(VehicleCategory)
  category: VehicleCategory;

  @IsNumber()
  year: number;

  @IsNumber()
  mileage: number;

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
  description_ar?: string;

  @IsString()
  @IsOptional()
  description_en?: string;
}
