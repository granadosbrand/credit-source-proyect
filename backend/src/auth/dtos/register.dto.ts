import { IsEmail, IsString, MinLength, IsEnum } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class RegisterDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
    password: string;

    @IsEnum(UserRole, { message: 'El rol debe ser USER o ADMIN' })
    role: UserRole;
}
