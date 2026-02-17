import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { RegisterDto, LoginDto, AuthResponseDto } from './dtos';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        private jwtService: JwtService,
    ) { }

    /**
     * Registrar nuevo usuario
     */
    async register(dto: RegisterDto): Promise<AuthResponseDto> {
        // Verificar si el usuario ya existe
        const existingUser = await this.usersRepository.findOne({
            where: { username: dto.username },
        });

        if (existingUser) {
            throw new BadRequestException('El nombre de usuario ya está registrado');
        }

        // Hash de la contraseña
        const passwordHash = await bcrypt.hash(dto.password, 10);

        // Crear nuevo usuario
        const user = this.usersRepository.create({
            username: dto.username,
            passwordHash,
            role: dto.role,
        });

        const savedUser = await this.usersRepository.save(user);

        // Generar JWT
        const access_token = this.generateToken(savedUser);

        return {
            access_token,
            user: {
                id: savedUser.id,
                username: savedUser.username,
                role: savedUser.role,
            },
        };
    }

    /**
     * Login: validar credenciales y retornar JWT
     */
    async login(dto: LoginDto): Promise<AuthResponseDto> {
        // Buscar usuario por username (incluir password)
        const user = await this.usersRepository.findOne({
            where: { username: dto.username },
            select: ['id', 'username', 'passwordHash', 'role'],
        });

        if (!user) {
            throw new UnauthorizedException('Credenciales inválidas');
        }

        // Validar contraseña
        const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Credenciales inválidas');
        }

        // Generar JWT
        const access_token = this.generateToken(user);

        return {
            access_token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
            },
        };
    }

    /**
     * Validar token JWT y retornar payload
     */
    async validateToken(token: string): Promise<any> {
        try {
            return this.jwtService.verify(token);
        } catch (error) {
            throw new UnauthorizedException('Token inválido o expirado');
        }
    }

    /**
     * Generar JWT
     */
    private generateToken(user: User): string {
        const payload = {
            sub: user.id, // Subject
            username: user.username,
            role: user.role,
        };

        return this.jwtService.sign(payload);
    }
}
