import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class AppController {
  @Get()
  checkHealth() {
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }
}
