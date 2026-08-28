import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

export interface LoginDto {
  username: string;
  password?: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async login(dto: LoginDto) {
    const username = (dto.username || '').trim().toLowerCase();
    const password = dto.password || '';
    const supabase = this.supabaseService.getClient();

    if (supabase) {
      try {
        // Tìm user theo username trong bảng users
        const { data: user, error } = await supabase
          .from('users')
          .select('*')
          .ilike('username', username)
          .maybeSingle();

        if (error) {
          this.logger.warn(`Lỗi truy vấn bảng users trên Supabase: ${error.message}`);
        }

        // Nếu tìm thấy user trong Database
        if (user) {
          if (user.password !== password) {
            throw new UnauthorizedException('Mật khẩu không chính xác');
          }
          if (user.role !== 'ADMIN') {
            throw new UnauthorizedException('Tài khoản này không có quyền Quản Trị (ADMIN)');
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

        // Nếu là tài khoản mặc định admin / admin123 nhưng chưa có trong DB -> Tự động thêm vào Supabase
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

          // Fallback thành công nếu bảng users chưa tạo kịp
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
      } catch (err) {
        if (err instanceof UnauthorizedException) throw err;
        this.logger.error(`Lỗi xác thực Supabase: ${err.message}`);

        // Fallback khẩn cấp cho admin / admin123
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

    // Fallback nếu Supabase chưa cấu hình
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

    throw new UnauthorizedException('Tài khoản hoặc mật khẩu không chính xác');
  }
}
