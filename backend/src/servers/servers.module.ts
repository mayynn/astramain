import { Module } from '@nestjs/common';
import { ServersController } from './servers.controller';
import { ServersService } from './servers.service';
import { ServerManageController } from './server-manage.controller';
import { ServerManageService } from './server-manage.service';
import { AffiliateModule } from '../affiliate/affiliate.module';

@Module({
  imports: [AffiliateModule],
  controllers: [ServersController, ServerManageController],
  providers: [ServersService, ServerManageService],
  exports: [ServersService],
})
export class ServersModule {}
