import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateNoteRuralSupplierDTO {
  @IsString()
  @IsNotEmpty()
  supplier_tax_id: string;

  @IsString()
  @IsOptional()
  note?: string;

  @IsString()
  @IsOptional()
  note_access_key?: string;

  @IsOptional()
  note_date?: Date;

  @IsString()
  @IsOptional()
  issuer_tax_id?: string;

  @IsString()
  @IsOptional()
  store_name?: string;

  @IsString()
  @IsOptional()
  receipt?: string;

  @IsString()
  @IsOptional()
  receipt_access_key?: string;

  @IsOptional()
  receipt_date?: Date;

  @IsString()
  @IsOptional()
  value?: number;

  @IsString()
  @IsOptional()
  status?: string;
}

export class CreateNotesRuralSuppliersListDTO {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateNoteRuralSupplierDTO)
  notes: CreateNoteRuralSupplierDTO[];
}
