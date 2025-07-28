import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
export interface JwtPayload {
    sub: number;
    username: string;
    role: string;
}
export interface LoginResponse {
    access_token: string;
    user: {
        id: number;
        username: string;
        fullName: string;
        role: {
            id: number;
            name: string;
            description?: string;
        };
    };
}
export declare class AuthService {
    private usersService;
    private jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    validateUser(username: string, password: string): Promise<any>;
    login(user: any): Promise<LoginResponse>;
    validateJwtPayload(payload: JwtPayload): Promise<any>;
}
