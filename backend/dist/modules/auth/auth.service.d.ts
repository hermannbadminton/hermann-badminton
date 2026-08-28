import { SupabaseService } from '../supabase/supabase.service';
export interface LoginDto {
    username: string;
    password?: string;
}
export declare class AuthService {
    private readonly supabaseService;
    private readonly logger;
    constructor(supabaseService: SupabaseService);
    login(dto: LoginDto): Promise<{
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
