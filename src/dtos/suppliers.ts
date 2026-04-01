import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSuppliersDTO {
  @IsString()
  @IsNotEmpty()
  tax_id: string;

  @IsString()
  @IsNotEmpty()
  legal_name: string;

  @IsOptional()
  @IsString()
  legal_nature: string;

  @IsOptional()
  @IsString()
  legal_description: string;

  @IsString()
  @IsNotEmpty()
  sector: string;
}

export class CreateSuppliersListDTO {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSuppliersDTO)
  suppliers: CreateSuppliersDTO[];
}

export class UpdateSuppliersDTO {
  @IsString()
  @IsNotEmpty()
  tax_id?: string;

  @IsString()
  @IsNotEmpty()
  legal_name?: string;

  @IsString()
  @IsNotEmpty()
  legal_nature?: string;

  @IsString()
  @IsNotEmpty()
  legal_description?: string;

  @IsString()
  @IsNotEmpty()
  sector?: string;
}
