import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsInt,
  IsDateString,
  IsEmail,
} from 'class-validator';

export class CreateCooperativeDto {
  @ApiProperty({ description: 'Cooperative name (English)' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Cooperative code' })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiPropertyOptional({ description: 'Province ID' })
  @IsString()
  @IsOptional()
  provinceId?: string;

  @ApiPropertyOptional({ description: 'District ID' })
  @IsString()
  @IsOptional()
  districtId?: string;

  @ApiPropertyOptional({ description: 'Municipality ID' })
  @IsString()
  @IsOptional()
  municipalityId?: string;

  @ApiPropertyOptional({ description: 'Ward number' })
  @IsInt()
  @IsOptional()
  wardNumber?: number;

  @ApiPropertyOptional({ description: 'Tole/Street name' })
  @IsString()
  @IsOptional()
  tole?: string;

  @ApiPropertyOptional({ description: 'Full address' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ description: 'Establishment year' })
  @IsOptional()
  @IsDateString()
  establishedYear?: string;

  @ApiPropertyOptional({ description: 'PAN number' })
  @IsString()
  @IsOptional()
  panNumber?: string;

  @ApiPropertyOptional({ description: 'Registration number' })
  @IsString()
  @IsOptional()
  registrationNumber?: string;

  @ApiPropertyOptional({ description: 'Logo URL' })
  @IsString()
  @IsOptional()
  logoUrl?: string;

  @ApiPropertyOptional({ description: 'Email address' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ description: 'Contact number' })
  @IsString()
  @IsOptional()
  contactNumber?: string;
}
