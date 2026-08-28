import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  private client: SupabaseClient | null = null;

  constructor(private readonly configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey =
      this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY') ||
      this.configService.get<string>('SUPABASE_ANON_KEY') ||
      this.configService.get<string>('SUPABASE_KEY');

    if (supabaseUrl && supabaseKey) {
      try {
        this.client = createClient(supabaseUrl, supabaseKey, {
          auth: {
            persistSession: false,
          },
        });
        this.logger.log(`🟢 Supabase client initialized successfully (${supabaseUrl})`);
      } catch (err) {
        this.logger.error(`❌ Failed to initialize Supabase client: ${err.message}`);
      }
    } else {
      this.logger.warn(
        '⚠️ SUPABASE_URL or SUPABASE_KEY is missing in .env. Falling back to in-memory mode until configured.',
      );
    }
  }

  getClient(): SupabaseClient | null {
    return this.client;
  }
}
