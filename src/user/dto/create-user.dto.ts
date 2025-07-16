import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  name: string;
  @IsEmail()
  @ApiProperty()
  email: string;
  @ApiProperty()
  @IsString()
  @MinLength(8, { message: 'Пароль должен быть не менее 8 символов' })
  @MaxLength(32, { message: 'Пароль должен быть не более 32 символов' })
  @Matches(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_])/, {
    message:
      'Пароль должен содержать хотя бы одну цифру, одну заглавную букву, одну строчную и один специальный символ',
  })
  password: string;
}
