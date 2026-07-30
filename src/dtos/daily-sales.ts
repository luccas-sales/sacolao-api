import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDailySaleDTO {
  @IsString()
  @IsNotEmpty()
  store_cnpj: string;

  @IsNumber()
  @IsNotEmpty()
  series: number;

  @IsNotEmpty()
  report_date: Date;

  @IsNumber()
  @IsOptional()
  total_nfce?: number;

  @IsNumber()
  @IsOptional()
  total_nfe?: number;

  @IsNumber()
  @IsOptional()
  total_summary_map?: number;
}

export class CreateDailySalesListDTO {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDailySaleDTO)
  sales: CreateDailySaleDTO[];
}

export class UpdateDailySaleDTO {
  @IsNumber()
  @IsOptional()
  total_nfce?: number;

  @IsNumber()
  @IsOptional()
  total_nfe?: number;

  @IsNumber()
  @IsOptional()
  total_summary_map?: number;
}
