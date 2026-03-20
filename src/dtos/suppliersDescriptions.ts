import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateSuppliersDescriptionsDTO {
  @IsString()
  @IsNotEmpty()
  legal_description: string;

  @IsString()
  @IsNotEmpty()
  sector: string;
}

export class UpdateSuppliersDescriptionsDTO {
  @IsOptional()
  @IsString()
  legal_description?: string;

  @IsOptional()
  @IsString()
  sector?: string;
}
