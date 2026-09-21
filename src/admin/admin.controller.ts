import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminGuard } from './admin.guard';

@UseGuards(AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('machines/pending')
  getPendingMachines() {
    return this.adminService.getPendingMachines();
  }

  @Post('machines/approve')
  approveMachine(@Body('mac') mac: string) {
    return this.adminService.approveMachine(mac);
  }

  @Post('machines/revoke')
  revokeMachine(@Body('mac') mac: string) {
    return this.adminService.revokeMachine(mac);
  }

  @Get('users/online')
  getOnlineUsers() {
    return this.adminService.getOnlineUsers();
  }

  @Get('users')
  getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Post('users')
  createUser(@Body() body: any) {
    return this.adminService.createUser(body);
  }
}
