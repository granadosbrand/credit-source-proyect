import { UserRole } from '../entities/user.entity';

export class AuthResponseDto {
    access_token: string;

    user: {
        id: string;
        username: string;
        role: UserRole;
    };
}
