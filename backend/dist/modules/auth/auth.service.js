"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../supabase/supabase.service");
let AuthService = AuthService_1 = class AuthService {
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
        this.logger = new common_1.Logger(AuthService_1.name);
    }
    async login(dto) {
        const username = (dto.username || '').trim().toLowerCase();
        const password = dto.password || '';
        const supabase = this.supabaseService.getClient();
        if (supabase) {
            try {
                const { data: user, error } = await supabase
                    .from('users')
                    .select('*')
                    .ilike('username', username)
                    .maybeSingle();
                if (error) {
                    this.logger.warn(`Lỗi truy vấn bảng users trên Supabase: ${error.message}`);
                }
                if (user) {
                    if (user.password !== password) {
                        throw new common_1.UnauthorizedException('Mật khẩu không chính xác');
                    }
                    if (user.role !== 'ADMIN') {
                        throw new common_1.UnauthorizedException('Tài khoản này không có quyền Quản Trị (ADMIN)');
                    }
                    return {
                        success: true,
                        message: 'Đăng nhập thành công với quyền Quản Trị Viên (Admin)',
                        user: {
                            id: user.id,
                            username: user.username,
                            fullName: user.full_name || 'Quản Trị Viên Hermann',
                            role: user.role,
                        },
                    };
                }
                if (username === 'admin' && password === 'admin123') {
                    const { data: newUser, error: insertErr } = await supabase
                        .from('users')
                        .insert({
                        username: 'admin',
                        password: 'admin123',
                        full_name: 'Quản Trị Viên Hermann CLB',
                        role: 'ADMIN',
                    })
                        .select()
                        .maybeSingle();
                    if (!insertErr && newUser) {
                        this.logger.log('✅ Đã tự động khởi tạo tài khoản admin trên Supabase');
                        return {
                            success: true,
                            message: 'Đăng nhập thành công với quyền Quản Trị Viên (Admin)',
                            user: {
                                id: newUser.id,
                                username: newUser.username,
                                fullName: newUser.full_name,
                                role: newUser.role,
                            },
                        };
                    }
                    return {
                        success: true,
                        message: 'Đăng nhập thành công với quyền Quản Trị Viên (Admin)',
                        user: {
                            id: 'admin-default',
                            username: 'admin',
                            fullName: 'Quản Trị Viên Hermann CLB',
                            role: 'ADMIN',
                        },
                    };
                }
            }
            catch (err) {
                if (err instanceof common_1.UnauthorizedException)
                    throw err;
                this.logger.error(`Lỗi xác thực Supabase: ${err.message}`);
                if (username === 'admin' && password === 'admin123') {
                    return {
                        success: true,
                        message: 'Đăng nhập thành công (Chế độ dự phòng)',
                        user: {
                            id: 'admin-default',
                            username: 'admin',
                            fullName: 'Quản Trị Viên Hermann CLB',
                            role: 'ADMIN',
                        },
                    };
                }
            }
        }
        if (username === 'admin' && password === 'admin123') {
            return {
                success: true,
                message: 'Đăng nhập thành công với quyền Quản Trị Viên (Admin)',
                user: {
                    id: 'admin-1',
                    username: 'admin',
                    fullName: 'Quản Trị Viên Hermann CLB',
                    role: 'ADMIN',
                },
            };
        }
        throw new common_1.UnauthorizedException('Tài khoản hoặc mật khẩu không chính xác');
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], AuthService);
//# sourceMappingURL=auth.service.js.map