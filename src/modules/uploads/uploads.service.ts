import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../app/database/database.service';
import { FilterGroup, Prisma } from '../../app/database/prisma';
import {
  CreateUploadOptions,
  GetUploadsSelections,
  UpdateUploadOptions,
  UpdateUploadSelections,
} from './uploads.type';

@Injectable()
export class UploadsService {
  constructor(private readonly client: DatabaseService) {}

  async findAll(selections: GetUploadsSelections) {
    const where: FilterGroup<Prisma.UploadWhereInput> = {
      deletedAt: null,
      AND: [],
    };
    if (selections.model) {
      where.AND.push({ model: selections.model });
    }
    if (selections.uploadableId) {
      where.AND.push({ uploadableId: selections.uploadableId });
    }
    if (selections.uploadType) {
      where.AND.push({ uploadType: selections.uploadType });
    }

    return await this.client.upload.findMany({ where });
  }

  /** Create one Upload to the database. */
  async createOne(options: CreateUploadOptions) {
    return await this.client.upload.create({ data: options });
  }

  /** Update one Upload to the database. */
  async updateOne(
    { uploadId }: UpdateUploadSelections,
    { deletedAt }: UpdateUploadOptions,
  ) {
    return await this.client.upload.update({
      where: { id: uploadId },
      data: { deletedAt },
    });
  }

  /** Delete one Upload to the database. */
  async deleteOne({ uploadId }: UpdateUploadSelections) {
    return await this.client.upload.delete({
      where: { id: uploadId },
    });
  }
}
