import { IsString, MinLength, IsEnum, MaxLength, Matches } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class RegisterDto {
    @IsString()
    @MinLength(3, { message: 'El usuario debe tener al menos 3 caracteres' })
    @MaxLength(30, { message: 'El usuario no puede superar 30 caracteres' })
    @Matches(/^[a-zA-Z0-9._-]+$/, { message: 'El usuario solo puede contener letras, números, punto, guion y guion bajo' })
    username: string;

    @IsString()
    @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
    password: string;

    @IsEnum(UserRole, { message: 'El rol debe ser USER o ADMIN' })
    role: UserRole;
}
