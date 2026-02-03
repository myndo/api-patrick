import {
  Controller,
  Get,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { reply } from '../../app/utils/reply';

import { isArray } from 'class-validator';
import { QueryTypeEnum } from '../../../prisma/generated/prisma/enums';
import { UserAuthGuard } from '../users/middleware';
import { CreateOrUpdateloadsDto, UploadsDto } from './uploads.dto';
import { UploadsService } from './uploads.service';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  /** Get all uploads */
  @Get(`/`)
  @UseGuards(UserAuthGuard)
  async findAll(@Res() res, @Req() req, @Query() query: UploadsDto) {
    const { model, uploadableId, uploadType } = query;
    const { organizationId } = req.user;

    const uploads = await this.uploadsService.findAll({
      organizationId,
      uploadableId,
      model: model?.toUpperCase() as QueryTypeEnum,
      uploadType: uploadType.toUpperCase(),
    });

    return reply({ res, results: uploads });
  }

  @Put(`/update`)
  @UseGuards(UserAuthGuard)
  async deleteAndUpdate(
    @Res() res,
    @Req() req,
    @Query() query: CreateOrUpdateloadsDto,
  ) {
    const { user } = req;
    const { model, uploadableId } = query;
    const { attachments, attachmentFiles } = req.body;

    if (attachments && isArray(attachments)) {
      const uploads = await this.uploadsService.findAll({
        uploadableId,
        uploadType: 'IMAGE',
        model: model?.toUpperCase() as QueryTypeEnum,
        organizationId: user?.organizationId,
      });
      for (const { id } of uploads) {
        const upload = attachments.find((i) => i?.id === id);
        if (!upload?.id) {
          await this.uploadsService.deleteOne({ uploadId: id });
        }
      }
    }

    if (attachmentFiles && isArray(attachmentFiles)) {
      const uploads = await this.uploadsService.findAll({
        uploadableId,
        uploadType: 'FILE',
        model: model?.toUpperCase() as QueryTypeEnum,
        organizationId: user?.organizationId,
      });
      for (const { id } of uploads) {
        const upload = attachmentFiles.find((i) => i?.id === id);
        if (!upload?.id) {
          await this.uploadsService.deleteOne({ uploadId: id });
        }
      }
    }

    return reply({ res, results: 'Image upload' });
  }
}
