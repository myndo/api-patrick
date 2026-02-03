import { Injectable } from '@nestjs/common';
import * as mime from 'mime-types';
//import * as sharp from 'sharp';
import { isArray } from 'class-validator';
import { KeyAsString, generateLongUUID } from '../../app/utils/commons';
import {
  dateTimeNowUtc,
  formateNowDateYYMMDD,
} from '../../app/utils/formate-date';
import { cloudflareR2ServiceAdapter } from '../integrations/aws-s3-service-adapter';
import { UploadsService } from './uploads.service';
import { UploadToAwsModel, UploadType } from './uploads.type';

const fieldnameLists: KeyAsString = {
  attachments: 'IMAGE',
  attachmentFiles: 'FILE',
};

@Injectable()
export class UploadsUtil {
  constructor(private readonly uploadsService: UploadsService) {}

  async saveOrUpdateAws({
    files,
    file: fileItem,
    ...payload
  }: UploadToAwsModel) {
    if (fileItem) {
      await this.uploadOneAndUploadOneAWS({ ...payload, file: fileItem });
    }

    if (files && isArray(files) && files?.length > 0) {
      for (const file of files) {
        await this.uploadOneAndUploadOneAWS({ ...payload, file });
      }
    }

    return 'ok';
  }

  async uploadOneAWS({ file, folder, model }: UploadToAwsModel) {
    let urlAWS: { Location: string };
    let fileName = '';

    if (file) {
      const extension = mime.extension(file.mimetype);
      const nameFile = `${formateNowDateYYMMDD(dateTimeNowUtc())}-${generateLongUUID(6)}`;
      fileName = `${`${nameFile}.${extension === 'mpga' ? 'mp3' : extension}`}`;

      urlAWS = await cloudflareR2ServiceAdapter({
        folder: folder,
        file: file.buffer,
        fileName: fileName,
        mimeType: file?.mimetype,
      });
    }
    return {
      model,
      urlAWS,
      fileName,
    };
  }

  async uploadOneAndUploadOneAWS({
    file,
    ...payload
  }: UploadToAwsModel): Promise<any> {
    const { fileName, urlAWS } = await this.uploadOneAWS({
      file,
      ...payload,
    });

    await this.uploadsService.createOne({
      ...payload,
      path: fileName,
      status: 'success',
      preview: urlAWS.Location,
      type: file?.mimetype,
      name: file?.originalname,
      size: Number(file?.size),
      uploadType: fieldnameLists[file?.fieldname] as UploadType,
    });
  }
}
