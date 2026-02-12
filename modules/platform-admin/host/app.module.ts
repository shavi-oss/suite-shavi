import { Module } from '@nestjs/common';
import { PlatformAdminModule } from '../platform-admin.module';

@Module({
  imports: [PlatformAdminModule],
})
export class AppModule {}
