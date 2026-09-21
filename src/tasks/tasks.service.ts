import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';
import { FilterTaskDto } from './dto/filter-task.dto.js';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  create(userId: string, dto: CreateTaskDto) {
    return this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        priority: dto.priority,
        userId,
      },
    });
  }

  findAll(userId: string, filters: FilterTaskDto) {
    return this.prisma.task.findMany({
      where: {
        userId,
        ...(filters.completed !== undefined && {
          completed: filters.completed === 'true',
        }),
        ...(filters.priority && { priority: filters.priority }),
      },
    });
  }

  async findOne(userId: string, taskId: string) {
    const task = await this.prisma.task.findFirst({
      where: { id: taskId, userId },
    });

    if (!task) {
      throw new NotFoundException('Tâche introuvable');
    }

    return task;
  }

  async update(userId: string, taskId: string, dto: UpdateTaskDto) {
    await this.findOne(userId, taskId); // vérifie l'existence + la propriété

    return this.prisma.task.update({
      where: { id: taskId },
      data: dto,
    });
  }

  async complete(userId: string, taskId: string) {
    await this.findOne(userId, taskId);

    return this.prisma.task.update({
      where: { id: taskId },
      data: { completed: true },
    });
  }

  async remove(userId: string, taskId: string) {
    await this.findOne(userId, taskId);

    return this.prisma.task.delete({
      where: { id: taskId },
    });
  }
}
