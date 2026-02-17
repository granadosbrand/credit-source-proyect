import { IsEmail, IsString, IsEnum } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class LoginDto {
    @IsEmail()
    email: string;

    @IsString()
    password: string;

    @IsEnum(UserRole, { message: 'El rol debe ser USER o ADMIN' })
    role: UserRole;
}
