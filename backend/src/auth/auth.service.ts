import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './entities/user.entity';
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
        console.log('Registering user with email:', dto.email, 'and role:', dto.role);
        // Verificar si el email ya existe
        const existingUser = await this.usersRepository.findOne({
            where: { email: dto.email },
        });

        if (existingUser) {
            throw new BadRequestException('El email ya está registrado');
        }

        // Hash de la contraseña
        const passwordHash = await bcrypt.hash(dto.password, 10);

        // Crear nuevo usuario
        const user = this.usersRepository.create({
            email: dto.email,
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
                email: savedUser.email,
                role: savedUser.role,
            },
        };
    }

    /**
     * Login: validar credenciales y retornar JWT
     */
    async login(dto: LoginDto): Promise<AuthResponseDto> {
        // Buscar usuario por email (incluir password)
        const user = await this.usersRepository.findOne({
            where: { email: dto.email },
            select: ['id', 'email', 'passwordHash', 'role'],
        });

        if (!user) {
            throw new UnauthorizedException('Credenciales inválidas');
        }

        // Validar contraseña
        const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Credenciales inválidas');
        }

        // Validar que el rol coincida
        if (user.role !== dto.role) {
            throw new UnauthorizedException(`El usuario no tiene rol ${dto.role}`);
        }

        // Generar JWT
        const access_token = this.generateToken(user);

        return {
            access_token,
            user: {
                id: user.id,
                email: user.email,
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
            email: user.email,
            role: user.role,
        };

        return this.jwtService.sign(payload);
    }
}
