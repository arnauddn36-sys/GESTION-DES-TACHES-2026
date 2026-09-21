import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import { TasksService } from './tasks.service.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';
import { FilterTaskDto } from './dto/filter-task.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Post()
  create(@Request() req: ExpressRequest, @Body() dto: CreateTaskDto) {
    const userId = (req.user as { userId: string }).userId;
    return this.tasksService.create(userId, dto);
  }

  @Get()
  findAll(@Request() req: ExpressRequest, @Query() filters: FilterTaskDto) {
    const userId = (req.user as { userId: string }).userId;
    return this.tasksService.findAll(userId, filters);
  }

  @Get(':id')
  findOne(@Request() req: ExpressRequest, @Param('id') id: string) {
    const userId = (req.user as { userId: string }).userId;
    return this.tasksService.findOne(userId, id);
  }

  @Put(':id')
  update(
    @Request() req: ExpressRequest,
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
  ) {
    const userId = (req.user as { userId: string }).userId;
    return this.tasksService.update(userId, id, dto);
  }

  @Patch(':id/complete')
  complete(@Request() req: ExpressRequest, @Param('id') id: string) {
    const userId = (req.user as { userId: string }).userId;
    return this.tasksService.complete(userId, id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Request() req: ExpressRequest, @Param('id') id: string) {
    const userId = (req.user as { userId: string }).userId;
    return this.tasksService.remove(userId, id);
  }
}
