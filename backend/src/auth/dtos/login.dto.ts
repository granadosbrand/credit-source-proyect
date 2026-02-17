import { IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class LoginDto {
    @IsString()
    @MinLength(3, { message: 'El usuario debe tener al menos 3 caracteres' })
    @MaxLength(30, { message: 'El usuario no puede superar 30 caracteres' })
    @Matches(/^[a-zA-Z0-9._-]+$/, { message: 'Usuario inválido' })
    username: string;

    @IsString()
    password: string;
}
