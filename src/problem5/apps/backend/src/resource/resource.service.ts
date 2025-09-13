// src/resource.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Resource, ResourceDocument } from './entities/resource.entity';

@Injectable()
export class ResourceService {
  constructor(
    @InjectModel('Resource')
    private readonly resourceModel: Model<ResourceDocument>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(createResourceDto: {
    name: string;
    description: string;
  }): Promise<Resource> {
    const createdResource = new this.resourceModel(createResourceDto);
    const saved = await createdResource.save();
    this.eventEmitter.emit('resource.created', saved);
    return saved;
  }

  async findAll(): Promise<Resource[]> {
    return this.resourceModel.find().exec();
  }

  async findOne(id: string): Promise<Resource> {
    const resource = await this.resourceModel.findById(id).exec();
    if (!resource) {
      throw new NotFoundException('Resource not found');
    }
    return resource;
  }

  async update(
    id: string,
    updateResourceDto: { name?: string; description?: string },
  ): Promise<Resource> {
    const updated = await this.resourceModel
      .findByIdAndUpdate(id, updateResourceDto, { new: true })
      .exec();
    if (!updated) {
      throw new NotFoundException('Resource not found');
    }
    this.eventEmitter.emit('resource.updated', updated);
    return updated;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.resourceModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException('Resource not found');
    }
    this.eventEmitter.emit('resource.deleted', id);
  }
}
