import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class SignInDTO {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(50)
  password: string;

  machineInfo?: {
    hostname: string;
    os_platform: string;
    mac_address: string;
    ip_address: string;
    app_version: string;
  };
}

export class UpdatePasswordDTO {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(50)
  oldPassword: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(50)
  newPassword: string;
}
