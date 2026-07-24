import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateNoteRuralSuppliersDTO {
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
  value?: string;

  @IsString()
  @IsOptional()
  status?: string;
}

export class CreateNotesRuralSuppliersListDTO {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateNoteRuralSuppliersDTO)
  notes: CreateNoteRuralSuppliersDTO[];
}

export class UpdateNoteRuralSuppliersDTO {
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
  value?: string;

  @IsString()
  @IsOptional()
  status?: string;
}
