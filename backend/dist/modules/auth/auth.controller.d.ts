import { AuthService, LoginDto } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto): Promise<{
        success: boolean;
        message: string;
        user: {
            id: any;
            username: any;
            fullName: any;
            role: any;
        };
    }>;
}
