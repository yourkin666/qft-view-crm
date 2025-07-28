import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(req: any, loginDto: LoginDto): Promise<{
        success: boolean;
        data: import("./auth.service").LoginResponse;
    }>;
    getProfile(req: any): {
        success: boolean;
        data: {
            id: any;
            username: any;
            fullName: any;
            role: {
                id: any;
                name: any;
                description: any;
            };
        };
    };
    logout(): {
        success: boolean;
        data: {
            message: string;
        };
    };
}
